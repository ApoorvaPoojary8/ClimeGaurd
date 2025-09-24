Got it 🙂 — you want the entire README.md contents wrapped inside a single code block so you can copy-paste directly.
Here it is:


---

# 🌦 ClimeGuard – Weather Risk Predictor

ClimeGuard is a *personalized weather risk prediction web application* that helps users plan events and outdoor activities by predicting risks like extreme heat, heavy rain, or strong winds.  
It uses *NASA POWER API* and *OpenWeather API* for accurate forecasts.

---

## 🚀 Features

* 🔐 *User Authentication* → Signup & Login system  
* 📍 *Location-based Risk Check* → Enter city/coordinates  
* 📅 *Date-specific Forecasts* → Select event date  
* 🏟 *Event-aware Suggestions* → Sports, Festivals, Outdoor, or General events  
* 🎨 *Modern UI* → Glassmorphism-based design with smooth interactions  
* ✅ *Clear Risk Levels*

  * 🟢 Safe  
  * 🟡 Warning  
  * 🔴 Not Recommended  

---

## 🛠 Tech Stack

### Frontend
* HTML5, CSS3, JavaScript (Vanilla)  
* Responsive UI with *Glassmorphism & Gradients*  

### Backend
* Node.js + Express  
* REST APIs for handling signup/login  
* Connected to frontend forms  

### APIs Used
* 🌍 *OpenStreetMap (Nominatim)* → Geocoding  
* 🌤 *OpenWeather API* → Real-time fallback weather  
* ☀ *NASA POWER API* → Temperature, Rainfall & Wind data  

---

## 📂 Project Structure


NASA - COPY/
│               
│
├── backend/
│   ├── node_modules/       # Installed backend dependencies
│   ├── .env                # Environment variables (API keys etc.)
│   ├── package.json        # Backend dependencies & scripts
│   ├── package-lock.json
│   ├── riskEvaluator.js    # Custom logic for risk calculations
│   └── server.js           # Express server entry point
│
├── frontend/
│   ├── dashboard.html      # Dashboard page
│   ├── index.html          # Login page
│   ├── package-lock.json   # (if you installed something for frontend)
│   ├── script.js           # Frontend logic / API calls
│   ├── signup.html         # Signup page
│   ├── style.css           # Styles
│   └── weather.html        # Weather risk page
│
└── README.md


---

## ⚙ Setup Instructions

### 1. Clone the Repository
bash
git clone https://github.com/your-username/climeguard.git
cd climeguard


### 2. Install Dependencies
bash
cd backend
npm install


### 3. Add API Keys
Create a .env file inside the backend folder with your keys:

NASA_API_KEY=your_nasa_api_key
OPENWEATHER_API_KEY=your_openweather_api_key

Update script.js if needed:
js
const nasaKey = "YOUR_NASA_API_KEY";
const openWeatherKey = "YOUR_OPENWEATHER_API_KEY";


### 4. Run Backend
bash
node server.js

Server runs on: http://localhost:5000

### 5. Open Frontend
Simply open frontend/index.html in your browser.  
(Login → Dashboard → Weather Risk Page)

---

## 📸 Screenshots

* 🔑 *Login & Signup* – Secure access  
* 📊 *Dashboard* – Quick access to weather check  
* 🌦 *Weather Risk Page* – Risk results with colors  

---

## 👩‍💻 Team

* *Apoorva* – Project Lead & Backend Developer  
* *Ananya* – Frontend Developer  
* *Aditi* – UI Design & Visualizations  
* *Bhoomika* – Data Analyst (Forecasting & Risk Models)  
* *Anushree* – Testing & Deployment  

---

## 📌 Future Enhancements

* ⏱ Hourly forecast support  
* 🗺 Interactive weather map  
* 📲 Mobile-friendly PWA version  
* 🔔 Notification system for weather alerts  

---

👉 With ClimeGuard, plan smarter and stay safe under any sky! 🌤


