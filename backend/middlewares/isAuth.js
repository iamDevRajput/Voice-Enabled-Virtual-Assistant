// // ye middleware cookie ke andar jo token h usko find karega , aur usme se user id nikalega
// // isse ye hoga agar user login tha aur logout nhi kiya h to user login hi rahe

// // middleware ke andar 3 cheeze hoti hai req, res, next(if everything is going good to usko aage badha denge)

// // request -> middleware(if it allow then so go to server) -> server

// import jwt from 'jsonwebtoken'

// const isAuth = async (req, res, next) => {

//     try {

//         // cookie se token nikaallenge
//         const token = req.cookies.token
//         console.log("cookies:", req.cookies);

//         // agar token nhi h to login karo
//         if(!token) {
//             return res.status(400).json({message: "token not found"})
//         }

//         // verifyToken ke andar object aayega ( jwt -> token ko verify karke return karenge userId(object), etc. )
//         const verifyToken = await jwt.verify(token, process.env.JWT_SECRET)

//         // req.userId ke andar user ki id hogi (req is an object)
//         req.userId = verifyToken.userId // verifyToken.userId : isse verifyToken me se userId nikaallenge

//         next()

//     } catch(error) {
//         console.log(error)
//         return res.status(500).json({message: "is Auth error"})
//     }
// }

// export default isAuth

// // ab hum controllers me user.controllers.js banayenge jo humme current user ka details dega

// ye middleware cookie ke andar jo token h usko find karega , aur usme se user id nikalega
// isse ye hoga agar user login tha aur logout nhi kiya h to user login hi rahe

// middleware ke andar 3 cheeze hoti hai req, res, next(if everything is going good to usko aage badha denge)

// request -> middleware(if it allow then so go to server) -> server

import jwt from 'jsonwebtoken';

const isAuth = async (req, res, next) => {
  try {
    // try from cookie
    let token = req.cookies?.token;

    // if not in cookie, try from Authorization header
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1]; // "Bearer <token>"
    }

    console.log("🟡 Step 1: Cookies:", req.cookies);
    console.log("🟡 Step 2: Authorization header:", req.headers.authorization);
    console.log("🟡 Step 3: Extracted token:", token);

    if (!token) {
      console.log("🔴 No token found. Blocking request.");
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🟢 Token verified successfully:", verifyToken);

    req.userId = verifyToken.userId;
    console.log("🟢 User ID extracted:", req.userId);

    next();
    console.log("🟢 Passed isAuth, moving to next middleware.");
  } catch (error) {
    console.log("🔴 isAuth error:", error);
    return res.status(403).json({ message: "Unauthorized: Invalid token" });
  }
};

export default isAuth;
