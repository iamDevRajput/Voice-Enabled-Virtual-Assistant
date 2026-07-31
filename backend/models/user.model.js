import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    assistantName: { type: String },
    coreTheme: { type: String, default: 'signal' },
    personalityMode: { type: String, default: 'Professional' },
    voiceId: { type: String, default: 'default' },
    glowIntensity: { type: Number, default: 0.5 },
    motionIntensity: { type: Number, default: 0.5 },
    ambientPreset: { type: String, default: 'aurora' },
    history: [
        { type: String }
    ]
  },
  { timestamps: true }
); 

const User = mongoose.model("User", userSchema);

export default User;
