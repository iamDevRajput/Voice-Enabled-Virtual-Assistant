/* multer is a  middleware(multer middleware) jo kya karega ->
    jaise hi hum frontend se image send karenge usko pakad ke public folder me daal dega
*/

import multer from "multer";

// jo image aayega usko store karenge
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb : call back
    cb(null, "./public"); // initially null but store image in backend/public
  },
  // This function tells multer how to name the uploaded file
  filename: (req, file, cb) => {
    // `cb` means "callback" → we use it to pass the final name of the file
    // Here we are keeping the original file name (like 'photo.jpg')
    cb(null, file.originalname);
  },
});

// Create an upload middleware using multer and the storage configuration
const upload = multer({ storage });

// Export this upload middleware so it can be used in routes
export default upload;
