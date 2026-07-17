import express from "express";
import { signUp, Login, logOut } from "../controllers/auth.controllers.js";

// routes hum log Router function ki help se banayege jo express me present hota hai
const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", Login);
authRouter.get("/logout", logOut);

export default authRouter;

// now hum userRouter ko index.js me bhi likh lete h