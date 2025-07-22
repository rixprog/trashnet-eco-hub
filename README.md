# 🚀 Installation & Running Instructions – TrashNet (Windows)

Follow these steps to install and run the TrashNet platform on **Windows**.

---

## 🧰 Prerequisites

- **Python 3.8+**  
  Download and install from [https://www.python.org/downloads/windows/](https://www.python.org/downloads/windows/)

- **Node.js & npm**  
  Download and install the LTS version from [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

- **Git** (Optional but recommended)  
  Download from [https://git-scm.com/download/win](https://git-scm.com/download/win)

---

## ⚙️ Installation Steps

### 1. Clone the Repository

Open your terminal (e.g., Git Bash, Command Prompt, PowerShell):

```bash
git clone https://github.com/rixprog/trashnet-eco-hub.git
cd trashnet-eco-hub
npm install
```

### 2. Backend Installation

Navigate to the backend directory and set up the Python environment:

```bash
cd waste-detection-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside the `waste-detection-backend` directory and add your Gemini API key:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

**Note:** Replace `YOUR_GEMINI_API_KEY` with your actual API key from Google AI Studio.

---

## 🚀 Running the Project

Use three separate terminals to run the services concurrently.

### Terminal 1 – Run the Backend Server

```bash
cd waste-detection-backend
venv\Scripts\activate
uvicorn main:app --reload
```

✅ **Backend will be available at:** [http://localhost:8000](http://localhost:8000)

### Terminal 2 – Run the Arduino Gateway Simulator

```bash
cd waste-detection-backend
venv\Scripts\activate
python arduino_gateway.py --bin_id A01
```

**💡 Pro Tip:** You can run this command with different `--bin_id` values in multiple terminals (e.g., `A01`, `B03`, `C02`) to simulate multiple smart bins.

### Terminal 3 – Run the React Frontend

From the root project directory:

```bash
npm run dev
```

✅ **Frontend will be available at:** [http://localhost:3000](http://localhost:3000) (or the port shown in terminal)

---

## 🔧 Troubleshooting

### Common Issues:

1. **Python not found:** Make sure Python is added to your PATH during installation
2. **Node.js commands not working:** Restart your terminal after installing Node.js
3. **Port already in use:** Stop any existing processes or use different ports
4. **Virtual environment issues:** Try `python -m pip install virtualenv` if venv doesn't work

### Stopping the Services:

- Press `Ctrl + C` in each terminal to stop the respective services
- To deactivate the Python virtual environment: `deactivate`

---

## 📁 Project Structure

```
trashnet-eco-hub/
├── waste-detection-backend/    # FastAPI backend
│   ├── main.py                # Main API server
│   ├── arduino_gateway.py     # IoT simulator
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── src/                       # React frontend source
├── package.json              # Node.js dependencies
└── README.md                 # Project documentation
```

---

## 🎉 You're Ready!

Once all three terminals are running successfully, you can access the TrashNet platform through your web browser. The system will simulate smart waste bins and provide real-time monitoring capabilities.

**Happy coding! 🌱♻️**