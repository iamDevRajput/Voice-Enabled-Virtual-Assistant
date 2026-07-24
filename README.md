# 🎙️ Voice-Enabled Virtual Assistant (MERN + Gemini)-

## 🚀 Problem Statement  
Users want a **personalized, voice-enabled AI assistant** that can understand natural language commands and respond instantly.  
Unlike generic assistants (Google/Siri/Alexa), this project allows you to:  
- Run on **custom backend** (MERN).  
- Define your **own assistant identity**.  
- Perform **voice-based tasks** like search, app opening, jokes, singing, etc.  
- Always respond in **structured JSON** for easy integration with frontend/mobile apps.  

---

## 📌 Key Features  
✅ **Custom Persona** – Assistant name & creator set dynamically  
✅ **Intent Classification** – Detects intent (`general`, `google-search`, `youtube-play`, etc.)  
✅ **Voice-Friendly Replies** – Short, natural spoken responses  
✅ **Direct Answers** – Handles factual questions directly  
✅ **App Integration** – Open calculator, WhatsApp, Instagram, etc.  
✅ **Entertainment Mode** – Tells jokes & sings short songs (~10s)  
✅ **Weather & Time Support** – Date, day, and month info  
✅ **Strict JSON Output** – Always responds in the required schema  

---

## 🛠️ Tech Stack  
| Layer        | Technology |
|--------------|------------|
| Frontend     | React.js (voice input + JSON handling) |
| Backend API  | Express.js (Node.js) |
| LLM          | Google Gemini (gemini-2.5-flash) |
| HTTP Client  | Axios |
| Deployment   | Vercel |

---

## ⚙️ Architecture  

### **Flow**
1. User speaks → text captured via Speech-to-Text.  
2. Text (`command`) sent to backend with `assistantName` + `userName`.  
3. Backend constructs a **prompt** with strict JSON schema.  
4. Gemini LLM processes and returns JSON response.  
5. JSON parsed in frontend → triggers action (search, play song, tell joke).  

---

## 📂 Project Structure
```
.
root
│── backend/ # Express + MongoDB + Gemini API
│ ├── config/ # Database, Cloudinary, token setup
│ ├── controllers/ # Route handlers (auth, user)
│ ├── middlewares/ # Auth & multer middlewares
│ ├── models/ # Mongoose models
│ ├── routes/ # Express routes
│ ├── public/ # Static files
│ ├── gemini.js # Gemini AI integration
│ ├── index.js # Server entry point
│ └── .env # Environment variables
│
│── frontend/ # React + Vite frontend
│ ├── src/
│ │ ├── assets/ # Images, icons
│ │ ├── components/ # Reusable UI components
│ │ ├── context/ # React Context (global state)
│ │ ├── pages/ # Page components (Home, Auth, Customize, etc.)
│ │ ├── App.jsx # Root React component
│ │ ├── main.jsx # Entry point
│ │ └── index.css # Global styles
│ ├── public/ # Static assets
│ └── vite.config.js # Vite config
│
└── README.md
```

---  


---

## ⚙️ Installation & Setup  

```bash
# 1️⃣ Clone Repository
git clone https://github.com/CodePandaAkhilesh/virtualAssistant
cd virtualAssistant

# 2️⃣ Install Dependencies
npm install

# 3️⃣ Create .env File
PORT=8000
MONGODB_URL="your-mongodb-connection-url"
JWT_SECRET="your-secret-key"

CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

GEMINI_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=your-gemini-api-key"

# 4️⃣ Run App
npm run dev
```
---

## 📡 API Usage

```
Request:
POST /api/user/asktoassistant
Content-Type: application/json

{
  "command": "play despacito on youtube",
  "assistantName": "Jarvis",
  "userName": "Akhilesh"
}

```

```
Response:
{
  "success": true,
  "data": {
    "type": "youtube-play",
    "userInput": "despacito",
    "response": "Sure, playing Despacito now."
  }
}
```
---

## 💡 Implementation Highlights

```
🎯 Strict JSON schema enforced in prompt → never breaks

🗣️ Voice-friendly responses – always short and conversational

🔑 Custom Creator Credit – mentions ${userName} if asked “Who made you?”

⚡ Instant Actions – JSON type directly triggers frontend action (open, play, search, joke)
```

---

## 🏆 Unique Selling Points (USP)

```
Personalized → Custom name & creator attribution

Actionable Output → JSON allows frontend/mobile automation

Entertainment + Utility → Mix of fun (jokes, songs) and practical tasks

Lightweight & Deployable → Runs on MERN + Gemini (serverless friendly)
```

---

## 📈 Potential Use-Cases

```
🏠 Smart Home Assistant (lights, music, reminders)

📱 App Launcher (open WhatsApp, Instagram, Calculator)

🌍 Info Assistant (facts, current events, weather)

🎵 Entertainment (play songs, jokes, sing)

🤝 Custom AI Agent for businesses with branded persona
```

---

## 🔮 Future Enhancements

```
🎤 Continuous Speech Recognition (real-time conversation)

🌦️ Live Weather API integration

🎶 Spotify/YouTube API for direct song playback

🧠 Memory & Personalization (remembers user queries)

📱 Cross-platform App (React Native)
```
```
