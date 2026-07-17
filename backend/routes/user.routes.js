// import express from "express";
// import { askToAssistant, getCurrentUser, updateAssistant } from "../controllers/user.controllers.js";
// import isAuth from "../middlewares/isAuth.js"
// import upload from "../middlewares/multer.js"

// // routes hum log Router function ki help se banayege jo express me present hota hai
// const userRouter = express.Router();

// userRouter.get("/current", isAuth, getCurrentUser);
// userRouter.post("/update", isAuth, upload.single("assistantImage"), updateAssistant);

// /* upload.single("assistantImage") : multer(upload name of multer middlewarre) is a  middleware(multer middleware) jo kya karega ->
//     jaise hi hum frontend se image send karenge usko pakad ke public folder me daal dega
// */

// userRouter.post("/asktoassistant", isAuth, askToAssistant);

// export default userRouter;
import express from "express";
import { askToAssistant, getCurrentUser, updateAssistant } from "../controllers/user.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

// routes hum log Router function ki help se banayege jo express me present hota hai
const userRouter = express.Router();

console.log("🟡 userRouter file loaded");

// Current user route
userRouter.get("/current", isAuth, (req, res, next) => {
  console.log("🟢 /api/user/current hit");
  getCurrentUser(req, res, next);
});

// Update assistant route
userRouter.post("/update", isAuth, upload.single("assistantImage"), (req, res, next) => {
  console.log("🟢 /api/user/update hit");
  updateAssistant(req, res, next);
});

/* upload.single("assistantImage") : multer(upload name of multer middlewarre) is a  middleware(multer middleware) jo kya karega ->
    jaise hi hum frontend se image send karenge usko pakad ke public folder me daal dega
*/

// Ask to assistant route
userRouter.post("/asktoassistant", isAuth, (req, res, next) => {
  console.log("🟢 /api/user/asktoassistant hit");
  askToAssistant(req, res, next);
});

export default userRouter;



//