import mongoose from "mongoose"

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("MongoDB connected")
    } catch(error) {
        console.error("MongoDB connection failed:", error.message)
    }
} 

export default connectDb