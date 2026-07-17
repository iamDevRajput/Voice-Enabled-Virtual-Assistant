import jwt from "jsonwebtoken";

const genToken = async (userId) => {
    try {
        // we will generate token by using json web token (jwt)
        const token = await jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "10d" }); // expires in 10 days (after 10 days user have to login again)
        return token;
    } catch (error) {
        console.error("Error generating token:", error);
        throw new Error("Token generation failed");
    }
};

export default genToken;
