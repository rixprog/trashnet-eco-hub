from fastapi import FastAPI, HTTPException, Response, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Union
import random
import cv2
import threading
import numpy as np
import os
from dotenv import load_dotenv
import google.generativeai as genai
import base64
import json
from datetime import datetime
import time # Import time module for timestamps

app = FastAPI()
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL DATA STORES ---
users = {
    "user1": {"credits": 0, "recycled_items": []}
}

# Pre-populate bins data to match Admin.tsx mock data, will be updated by Arduino
# Added 'last_seen' for connection status and 'connection_status' itself
bins_data: Dict[str, Dict[str, Union[str, int, float, bool]]] = {
    "A01": {
        "id": 'A01',
        "name": 'Central Park Bin',
        "location": '123 Park Ave, Central District',
        "lat": 40.7829,
        "lng": -73.9654,
        "status": 'active', # Will be dynamically updated (active, full, maintenance)
        "fillLevel": 45,    # Will be dynamically updated (0-100)
        "lastEmptied": '2 hours ago', # Placeholder
        "totalCollections": 156, # Placeholder
        "last_seen": int(time.time()), # Timestamp of last update/heartbeat
        "connection_status": "online" # online/offline
    },
    "B03": {
        "id": 'B03',
        "name": 'Shopping Mall Bin',
        "location": '456 Mall Blvd, Downtown',
        "lat": 34.0522,
        "lng": -118.2437,
        "status": 'full',
        "fillLevel": 90,
        "lastEmptied": '1 day ago',
        "totalCollections": 230,
        "last_seen": int(time.time()),
        "connection_status": "online"
    },
    "C05": {
        "id": 'C05',
        "name": 'Community Center Bin',
        "location": '789 Community Rd, West Side',
        "lat": 33.9530,
        "lng": -117.3962,
        "status": 'maintenance',
        "fillLevel": 10,
        "lastEmptied": '3 days ago',
        "totalCollections": 80,
        "last_seen": int(time.time()),
        "connection_status": "online"
    },
}

CATEGORIES = ["plastic", "metal", "glass", "paper", "wood"]

CREDIT_VALUES = {
    "plastic": 10,
    "metal": 40,
    "glass": 20,
    "wood": 15,
    "paper": 5,
    "unknown": 0
}

cap = cv2.VideoCapture(0)
frame_lock = threading.Lock()
latest_frame = None

def grab_frames():
    global latest_frame
    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        with frame_lock:
            latest_frame = frame

grabber_thread = threading.Thread(target=grab_frames, daemon=True)
grabber_thread.start()

# --- Pydantic Models ---
class DetectionResult(BaseModel):
    category: str
    specific_item: str = "unknown"
    credits_value: int = 0

class SubmitWasteRequest(BaseModel):
    user_id: str
    bin_id: str
    category: str
    specific_item: str = "unknown"
    credits_value: int = 0

class UserCredits(BaseModel):
    user_id: str
    credits: int
    recycled_items: list[Dict[str, Union[str, int]]]

# New models for Arduino gateway communication
class BinStatusUpdate(BaseModel):
    bin_id: str
    distance_cm: int
    fill_percentage: int
    status_text: str # "Full", "Half", "Empty"
    timestamp: int

class BinHeartbeat(BaseModel):
    bin_id: str
    timestamp: int

# Response model for frontend Admin panel
class AdminBinData(BaseModel):
    id: str
    name: str
    location: str
    lat: float
    lng: float
    status: str # 'active' | 'full' | 'maintenance' (derived)
    fillLevel: int # Percentage (0-100)
    lastEmptied: str
    totalCollections: int
    connection_status: str # 'online' | 'offline'
    last_seen_timestamp: int # Unix timestamp for admin debugging

# --- HELPER FUNCTIONS ---
def map_gemini_to_category(description: str) -> str:
    desc = description.lower()
    if any(word in desc for word in ["plastic", "bottle", "container", "bag"]):
        return "plastic"
    if any(word in desc for word in ["metal", "can", "aluminum", "steel"]):
        return "metal"
    if any(word in desc for word in ["glass", "jar", "bottle"]):
        return "glass"
    if any(word in desc for word in ["paper", "cardboard", "sheet", "newspaper"]):
        return "paper"
    if any(word in desc for word in ["wood", "stick", "timber", "plywood"]):
        return "wood"
    return "unknown"

def parse_gemini_response(text_response: str) -> tuple[str, str]:
    clean_response = text_response.strip()
    if clean_response.startswith('```json') and clean_response.endswith('```'):
        clean_response = clean_response[len('```json'):-len('```')].strip()
    
    try:
        data = json.loads(clean_response)
        category = data.get("category", "unknown").lower()
        specific_item = data.get("item_name", "unknown").lower()
        return category, specific_item
    except json.JSONDecodeError as e:
        print(f"JSONDecodeError: Could not parse response as JSON. Error: {e}. Cleaned response: '{clean_response}'. Original response: '{text_response}'")
        category = map_gemini_to_category(text_response)
        specific_item = "unknown_item_parsing_error"
        return category, specific_item

# --- ENDPOINTS ---
@app.get("/detect-waste", response_model=DetectionResult)
def detect_waste():
    with frame_lock:
        frame = latest_frame
    if frame is None:
        print("No image frame available for detect-waste. Returning 'no image'.")
        return {"category": "unknown", "specific_item": "no image", "credits_value": 0}
    
    _, jpeg = cv2.imencode('.jpg', frame)
    img_bytes = jpeg.tobytes()
    
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = "Analyze the waste item in the image. Respond in JSON format with two keys: 'category' (classify as plastic, metal, glass, paper, or wood) and 'item_name' (a specific name for the item, e.g., 'plastic bottle', 'aluminum can', 'cardboard box')."
    
    try:
        response = model.generate_content([
            prompt,
            genai.types.content.ImageContent(
                data=img_bytes,
                mime_type="image/jpeg"
            )
        ])
        
        desc = response.text if hasattr(response, 'text') else str(response)
        print(f"Gemini raw response (detect-waste): {desc}")
        category, specific_item = parse_gemini_response(desc)
        
        credits = CREDIT_VALUES.get(category, 0)
        print(f"Parsed Result (detect-waste): Category='{category}', Specific Item='{specific_item}', Assigned Credits={credits}")
        
    except Exception as e:
        print(f"Gemini error in detect-waste: {e}")
        category = "unknown"
        specific_item = "error"
        credits = 0
    return {"category": category, "specific_item": specific_item, "credits_value": credits}


@app.get("/video-feed")
def video_feed():
    def gen():
        while True:
            with frame_lock:
                frame = latest_frame
            if frame is None:
                continue
            ret, jpeg = cv2.imencode('.jpg', frame)
            if not ret:
                continue
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n')
    return StreamingResponse(gen(), media_type='multipart/x-mixed-replace; boundary=frame')

@app.post("/submit-waste", response_model=UserCredits)
def submit_waste(data: SubmitWasteRequest):
    if data.user_id not in users:
        users[data.user_id] = {"credits": 0, "recycled_items": []}
    
    users[data.user_id]["credits"] += data.credits_value
    users[data.user_id]["recycled_items"].append({
        "category": data.category,
        "item_name": data.specific_item,
        "timestamp": str(datetime.now()),
        "bin_id": data.bin_id,
        "credits": data.credits_value
    })
    
    print(f"Submitted waste: User={data.user_id}, Category={data.category}, Item='{data.specific_item}', Bin={data.bin_id}, Credits Added={data.credits_value}")
    return {"user_id": data.user_id, "credits": users[data.user_id]["credits"], "recycled_items": users[data.user_id]["recycled_items"]}


@app.post("/classify-image", response_model=DetectionResult)
def classify_image(file: UploadFile = File(...)):
    try:
        img_bytes = file.file.read()
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = "Analyze the waste item in the image. Respond in JSON format with two keys: 'category' (classify as plastic, metal, glass, paper, or wood) and 'item_name' (a specific name for the item, e.g., 'plastic bottle', 'aluminum can', 'cardboard box')."
        
        response = model.generate_content([
            prompt,
            {
                "mime_type": "image/jpeg",
                "data": img_bytes
            }
        ])
        
        desc = response.text if hasattr(response, 'text') else str(response)
        print(f"Gemini raw response (classify-image): {desc}")
        category, specific_item = parse_gemini_response(desc)
        
        credits = CREDIT_VALUES.get(category, 0)
        print(f"Parsed Result (classify-image): Category='{category}', Specific Item='{specific_item}', Assigned Credits={credits}")
    except Exception as e:
        print(f"Gemini error in classify-image: {e}")
        category = "unknown"
        specific_item = "error"
        credits = 0
    return {"category": category, "specific_item": specific_item, "credits_value": credits}


@app.get("/user-credits/{user_id}", response_model=UserCredits)
def get_credits(user_id: str):
    if user_id not in users:
        users[user_id] = {"credits": 0, "recycled_items": []}
    
    print(f"Fetching credits for user: {user_id}. Credits: {users[user_id]['credits']}, Recycled Items Count: {len(users[user_id]['recycled_items'])}")
    return {"user_id": user_id, "credits": users[user_id]["credits"], "recycled_items": users[user_id]["recycled_items"]}


# --- NEW: Endpoints for Arduino Gateway ---

@app.post("/bin-status-update")
def post_bin_status_update(data: BinStatusUpdate):
    if data.bin_id not in bins_data:
        # If a new bin ID is reported, initialize it with default values
        print(f"Warning: Received status for unknown bin_id: {data.bin_id}. Initializing with default mock data.")
        bins_data[data.bin_id] = {
            "id": data.bin_id,
            "name": f"New Bin {data.bin_id}",
            "location": "Unknown Location",
            "lat": 0.0,
            "lng": 0.0,
            "lastEmptied": "N/A",
            "totalCollections": 0,
            "connection_status": "online" # Assume online upon first update
        }
    
    current_bin = bins_data[data.bin_id]
    current_bin["fillLevel"] = data.fill_percentage
    current_bin["last_seen"] = data.timestamp
    current_bin["connection_status"] = "online" # If we get an update, it's online

    # Update 'status' field based on fill percentage
    if data.fill_percentage >= 90:
        current_bin["status"] = "full"
    elif data.fill_percentage <= 10:
        current_bin["status"] = "active" # Nearly empty
    else:
        current_bin["status"] = "active" # Half full or less than 90% full

    print(f"Received bin status for {data.bin_id}: Fill={data.fill_percentage}%, Status='{current_bin['status']}', Last Seen={datetime.fromtimestamp(data.timestamp)}")
    return {"message": "Bin status updated successfully"}

@app.post("/bin-heartbeat")
def post_bin_heartbeat(data: BinHeartbeat):
    if data.bin_id not in bins_data:
        print(f"Warning: Received heartbeat for unknown bin_id: {data.bin_id}. Ignoring.")
        raise HTTPException(status_code=404, detail="Bin ID not found")

    bins_data[data.bin_id]["last_seen"] = data.timestamp
    bins_data[data.bin_id]["connection_status"] = "online"
    # print(f"Received heartbeat for {data.bin_id}. Last seen updated.")
    return {"message": "Bin heartbeat received"}

@app.get("/admin/bins-data", response_model=Dict[str, AdminBinData])
def get_admin_bins_data():
    current_time = int(time.time())
    offline_threshold = 30 # seconds

    response_data = {}
    for bin_id, bin_info in bins_data.items():
        # Determine connection status based on last_seen
        if current_time - int(bin_info.get("last_seen", 0)) > offline_threshold:
            bin_info["connection_status"] = "offline"
        else:
            bin_info["connection_status"] = "online" # Re-confirm online if within threshold

        # Ensure all fields for AdminBinData are present and correctly typed
        response_data[bin_id] = AdminBinData(
            id=bin_info["id"],
            name=bin_info["name"],
            location=bin_info["location"],
            lat=float(bin_info["lat"]),
            lng=float(bin_info["lng"]),
            status=str(bin_info["status"]),
            fillLevel=int(bin_info["fillLevel"]),
            lastEmptied=str(bin_info["lastEmptied"]),
            totalCollections=int(bin_info["totalCollections"]),
            connection_status=str(bin_info["connection_status"]),
            last_seen_timestamp=int(bin_info["last_seen"])
        )
    print(f"Serving admin bins data. Current status of bins: { {id: {'fillLevel': bin['fillLevel'], 'status': bin['status'], 'connection_status': bin['connection_status']} for id, bin in bins_data.items()} }")
    return response_data