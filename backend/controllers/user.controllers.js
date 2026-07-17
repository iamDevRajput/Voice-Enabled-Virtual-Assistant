import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
    
  try {

    const userId = req.userId;
    const user = await User.findById(userId).select("-password"); // isse user mil jayega aur usme se hum password hata ke return karayenge

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    return res.status(200).json(user);

  } catch (error) {
    return res.status(400).json({ message: "get current user error" });
  }
};

// do cheeze update karna hai assistant name and assistant name

export const updateAssistant = async (req, res) => {

  try {

    // assistantName : name of assistant , imageUrl : url of selectedImage (send from frontend by user)
    const { assistantName, imageUrl } = req.body;

    let assistantImage;

    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      // ❌ If no file was uploaded,
      // then just use the existing image URL instead
      assistantImage = imageUrl;
    }
    // ab assistantName : name of assistant , imageUrl : url of selectedImage dono aa chuka hai , ab hum current user ko update kar denge

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        assistantName,
        assistantImage,
      },
      { new: true }
    ).select("-password");
    // {new: true} means : jo bhi user return ho yo new details ke saath return ho

    return res.status(200).json(user);

  } catch (error) {
    return res.status(400).json({ message: "updateAssistantError user error" });
  }
};

// ab updateAssistant ke liye route bana lete hai goto : backend/routes/user.routes.js

export const askToAssistant = async (req, res) => {
  try {

    const { command } = req.body;

    const user = await User.findById(req.userId);

    user.history.push(command);
    user.save();

    const userName = user.name;
    const assistantName = user.assistantName;
    const result = await geminiResponse(command, assistantName, userName);

    if (!result) {
      return res.status(500).json({ response: "I'm sorry, I couldn't connect to my AI brain. Please check the API configuration." });
    }

    const jsonMatch = result.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      return res.status(400).json({ response: "sorry, i can't understand" });
    }
    const gemResult = JSON.parse(jsonMatch[0]);
    console.log(gemResult);
    const type = gemResult.type;

    switch (type) {

      case "get-date":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `current date is ${moment().format("YYYY-MM-DD")}`,
        });
      case "get-time":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `current time is ${moment().format("hh:mm A")}`,
        });
      case "get-day":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `today is ${moment().format("dddd")}`,
        });
      case "get-month":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `today is ${moment().format("MMMM")}`,
        });

      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "general":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "whatsapp-open":
      case "chatgpt-open":
      case "weather-show":
      case "joke-tell":
      case "song-sing":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
        });

      default:
        return res
          .status(400)
          .json({ response: "I didn't understand that command." });
    }

  } catch (error) {
    console.error("🔴 Step X [askToAssistant] Fatal error:", error);
    return res.status(500).json({
      success: false,
      error: "AssistantError",
      message: "Something went wrong while asking the assistant.",
      details: error.message || "Internal server error",
    });
  }
};
