import os
import cv2
from dotenv import load_dotenv
import google.generativeai as genai
import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk

# Load Gemini API key
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

IMG_PATH = "test.jpg"

# Gemini mapping logic
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

def classify_image_file(image_path):
    with open(image_path, "rb") as f:
        img_bytes = f.read()
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = "Classify this waste item as plastic, metal, glass, paper, or wood."
    try:
        response = model.generate_content([
            prompt,
            {
                "mime_type": "image/jpeg",
                "data": img_bytes
            }
        ])
        print("Gemini response:", response)
        desc = response.text if hasattr(response, 'text') else str(response)
        category = map_gemini_to_category(desc)
        print("Mapped category:", category)
    except Exception as e:
        print("Gemini error:", e)
        category = "unknown"
    return category

def capture_with_opencv():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Could not open webcam.")
        return False
    print("Press SPACE to capture, ESC to exit.")
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame.")
            break
        cv2.imshow("Capture - Press SPACE", frame)
        k = cv2.waitKey(1)
        if k%256 == 27:
            # ESC pressed
            print("Escape hit, closing...")
            break
        elif k%256 == 32:
            # SPACE pressed
            cv2.imwrite(IMG_PATH, frame)
            print(f"Image saved to {IMG_PATH}")
            break
    cap.release()
    cv2.destroyAllWindows()
    return os.path.exists(IMG_PATH)

def preview_with_tkinter(image_path):
    root = tk.Tk()
    root.title("Captured Image Preview")
    img = Image.open(image_path)
    img = img.resize((320, 240))
    tk_img = ImageTk.PhotoImage(img)
    label = tk.Label(root, image=tk_img)
    label.pack()
    def on_close():
        root.destroy()
    btn = tk.Button(root, text="OK", command=on_close)
    btn.pack()
    root.mainloop()

def main():
    if capture_with_opencv():
        preview_with_tkinter(IMG_PATH)
        print("Classifying with Gemini...")
        classify_image_file(IMG_PATH)
    else:
        print("No image captured.")

if __name__ == "__main__":
    main() 