import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import geminiResponse from "./gemini.js"

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

if (!process.env.GEMINI_API_URL || process.env.GEMINI_API_URL.trim() === "") {
    console.error("\n❌ CRITICAL STARTUP ERROR ❌");
    console.error("GEMINI_API_URL is missing or empty in your backend/.env file.");
    console.error("Please add your Gemini API URL to the .env file before starting the server.");
    console.error("Example: GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY\n");
    process.exit(1);
}
const app = express()

// cors is use to connect frontend and backend
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            "https://virtualassistant-03vg.onrender.com",
            "https://voice-enabled-virtual-assistant-tlmt.onrender.com",
            "https://voice-enabled-virtual-assistant.vercel.app",
            "https://voice-enabled-virtual-assistant-production.up.railway.app"
        ];
        // Allow any localhost port, vercel apps, railway apps, render apps, or specific allowed origins
        if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin) || /^https:\/\/.*\.onrender\.com$/.test(origin) || /^https:\/\/.*\.up\.railway\.app$/.test(origin) || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}))

const PORT = process.env.PORT || 5000

// akar koi data aayega to usko json format me bhejna hoga
app.use(express.json()) 

app.use(cookieParser()) 

/* app.use() -> middleware
   Ye middleware function /signup, /signin(login), /logout use karne se pehle uske aage /api/auth laga dega
   URL : URL/api/auth/signup -> example
*/ 
app.use("/api/auth", authRouter)  // whenever a request starts with this path( /api/auth ), send it to this router (authRouter)
app.use("/api/user", userRouter) // whenever a request starts with this path( /api/user ), send it to this router (userRouter)

// ✅ Test route to check if backend is running
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working 🚀" });
});



app.get("/", async (req, res) => {
    try {
        const { prompt, assistantName, userName } = req.query;

        let result = await geminiResponse(prompt, assistantName, userName);

        // If Gemini wrapped JSON in ```json ... ```
        if (typeof result === "string") {
            result = result.replace(/```json|```/g, "").trim();
        }

        // Parse safely
        let parsed;
        try {
            parsed = JSON.parse(result);
        } catch {
            return res.status(400).json({ error: "Invalid JSON from Gemini", raw: result });
        }

        res.json(parsed);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});



app.listen(PORT, () => {
    connectDb()
    console.log(`Server is running on port ${PORT}`)
})

