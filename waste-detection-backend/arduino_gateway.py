import serial
import time
import requests
import re
import argparse # To handle command-line arguments for BIN_ID

# --- CONFIGURATION ---
PORT = 'COM4'        # Change if your Arduino is on a different port (e.g., '/dev/ttyUSB0' on Linux)
BAUD_RATE = 9600     # Must match the baud rate in your Arduino code
BIN_HEIGHT = 62      # in cm (your bin height, from sensor to bottom when empty)
API_BASE_URL = 'http://localhost:8000' # Your FastAPI server URL

# --- Parse command-line arguments ---
parser = argparse.ArgumentParser(description="Arduino Gateway for TrashNet Eco-Hub.")
parser.add_argument('--bin_id', type=str, required=True,
                    help='Unique ID of the bin this gateway is reporting for (e.g., A01, B03).')
args = parser.parse_args()

BIN_ID = args.bin_id

# --- CONNECT TO ARDUINO ---
def connect_to_arduino(port, baud_rate):
    """Attempts to establish serial connection to Arduino."""
    try:
        arduino = serial.Serial(port, baud_rate, timeout=1)
        time.sleep(2)  # wait for connection to stabilize
        print(f"Connected to Arduino on {port} for Bin ID: {BIN_ID}. Listening...\n")
        return arduino
    except Exception as e:
        print(f"Could not connect to Arduino on {port}: {e}")
        return None

arduino_connection = connect_to_arduino(PORT, BAUD_RATE)

# --- HELPER FUNCTIONS ---
def send_bin_status(bin_id, distance_cm, fill_percentage, status_text):
    """Sends bin status update to FastAPI server."""
    endpoint = f"{API_BASE_URL}/bin-status-update"
    payload = {
        "bin_id": bin_id,
        "distance_cm": distance_cm,
        "fill_percentage": fill_percentage,
        "status_text": status_text,
        "timestamp": int(time.time()) # Unix timestamp
    }
    try:
        response = requests.post(endpoint, json=payload, timeout=5)
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
        # print(f"Sent status for {bin_id}: {status_text}, {fill_percentage}%")
    except requests.exceptions.ConnectionError:
        print(f"Warning: Could not connect to FastAPI server at {API_BASE_URL}. Is it running?")
    except requests.exceptions.Timeout:
        print(f"Warning: Request to FastAPI server timed out.")
    except requests.exceptions.HTTPError as e:
        print(f"Warning: HTTP error when sending status: {e}")
    except Exception as e:
        print(f"An unexpected error occurred while sending status: {e}")

def send_heartbeat(bin_id):
    """Sends a heartbeat to FastAPI server to indicate gateway is active."""
    endpoint = f"{API_BASE_URL}/bin-heartbeat"
    payload = {
        "bin_id": bin_id,
        "timestamp": int(time.time())
    }
    try:
        requests.post(endpoint, json=payload, timeout=2)
    except requests.exceptions.ConnectionError:
        pass # Suppress connection errors for heartbeats, as they are frequent
    except Exception as e:
        print(f"An unexpected error occurred while sending heartbeat: {e}")

# --- MAIN LOOP ---
last_heartbeat_time = 0
HEARTBEAT_INTERVAL = 10 # seconds

try:
    while True:
        if arduino_connection:
            if arduino_connection.in_waiting > 0:
                line = arduino_connection.readline().decode().strip()
                if line:
                    print(f"Arduino says: {line}")
                    # Regex to extract Distance and Status
                    match = re.search(r"Distance: (\d+) cm \| Status: (.+)", line)
                    if match:
                        distance_cm = int(match.group(1))
                        status_text = match.group(2)

                        # Calculate fill percentage (0% full when distance is BIN_HEIGHT, 100% full when distance is 0)
                        # We reverse the distance as closer means fuller
                        fill_level_distance = BIN_HEIGHT - distance_cm
                        if fill_level_distance < 0: fill_level_distance = 0 # Cannot be less than 0
                        
                        fill_percentage = (fill_level_distance / BIN_HEIGHT) * 100
                        if fill_percentage > 100: fill_percentage = 100 # Cannot be more than 100
                        if fill_percentage < 0: fill_percentage = 0 # Ensure non-negative

                        send_bin_status(BIN_ID, distance_cm, round(fill_percentage), status_text)
                    else:
                        print(f"Warning: Could not parse Arduino line: {line}")
        else:
            # Attempt to reconnect if connection was lost
            print("Arduino not connected. Attempting to reconnect...")
            arduino_connection = connect_to_arduino(PORT, BAUD_RATE)
            time.sleep(5) # Wait before retrying

        # Send heartbeat periodically
        current_time = time.time()
        if current_time - last_heartbeat_time >= HEARTBEAT_INTERVAL:
            send_heartbeat(BIN_ID)
            last_heartbeat_time = current_time

        time.sleep(1) # Read from serial approximately once per second

except KeyboardInterrupt:
    print("\nDisconnected from Arduino.")
    if arduino_connection:
        arduino_connection.close()
except Exception as e:
    print(f"An unhandled error occurred: {e}")
    if arduino_connection:
        arduino_connection.close()