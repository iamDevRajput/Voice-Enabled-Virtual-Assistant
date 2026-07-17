// The Cloudinary package has different API versions (v1, v2). Most people use v2
// It imports Cloudinary’s version 2 API and gives it the name cloudinary in your code

import { v2 as cloudinary } from 'cloudinary';

// Import 'fs' module to work with files (like deleting a file after upload)
import fs from "fs"

// Define an async function to upload a file to Cloudinary
const uploadOnCloudinary = async (filePath) => {

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    // 2️⃣ Try to upload the file
    try {
        // Upload the file at 'filePath' to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(filePath)
        
        // 3️⃣ After uploading, delete the file from local storage to save space
        fs.unlinkSync(filePath)
        
        // 4️⃣ Return the secure URL of the uploaded file
        return uploadResult.secure_url
    } catch(error) {
        fs.unlinkSync(filePath)
        return res.status(500).json({message: "cloudinary error"})
    }
}

export default uploadOnCloudinary

/* cloudinary pe upload karne ke liye ban chuka hai, lekin ab hum ek middleware(multer middleware) banayenge jo kya karega ->
    jaise hi hum frontend se image send karenge usko pakad ke public folder me daal dega
*/