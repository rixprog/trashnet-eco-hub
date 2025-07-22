# Waste Detection Backend

This is a local backend service for real-time waste detection and user credit management using FastAPI and OpenCV.

## Features

- Real-time waste category detection (plastic, metal, glass, paper, wood)
- User credit management
- REST API for integration with frontend

## Setup

1. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Service

```bash
uvicorn main:app --reload
```

- The API will be available at `http://localhost:8000`.
- Endpoints:
  - `GET /detect-waste` — Get detected waste category (mocked for now)
  - `POST /submit-waste` — Submit detected waste and update credits
  - `GET /user-credits/{user_id}` — Get user credits

## Next Steps

- Integrate real OpenCV detection logic
- Connect with frontend for real-time updates
