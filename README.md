# 🚀 Installation & Running Instructions – TrashNet (Windows)

Follow these steps to install and run the TrashNet platform on **Windows**.

---

## 🧰 Prerequisites

- **Python 3.8+**  
  Download and install from [https://www.python.org/downloads/windows/](https://www.python.org/downloads/windows/)

- **Node.js & npm**  
  Download and install the LTS version from [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

---

## ⚙️ Installation Steps

### 1. Clone the Repository

Open your terminal (e.g., Git Bash, Command Prompt, PowerShell):

```bash
git clone https://github.com/rixprog/trashnet-eco-hub.git

cd trashnet-eco-hub

npm install


## 2. Backend installation

cd waste-detection-backend

python -m venv venv venv\Scripts\activate

pip install -r requirements.txt

Create a .env file inside the waste-detection-backend directory and add your Gemini API key:

GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

## 3. Running the project

Use three separate terminals to run the services concurrently.

## Terminal 1 – Run the Backend Server

cd waste-detection-backend

venv\Scripts\activate

uvicorn main:app --reload

This starts the FastAPI backend at: http://localhost:8000

## Terminal 2 – Run the Arduino Gateway Simulator

cd waste-detection-backend

venv\Scripts\activate

python arduino_gateway.py --bin_id A01

You can run this command with different --bin_id values in multiple terminals (e.g., A01, B03, C02) to simulate multiple bins.

## Terminal 3 – Run the React Frontend

From the root project directory:


npm run dev

This will start the frontend