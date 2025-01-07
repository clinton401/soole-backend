import { v2 as cloudinary } from 'cloudinary';
import {config} from 'dotenv';
config();
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_secret = process.env.CLOUDINARY_API_SECRET;
const api_key = process.env.CLOUDINARY_API_KEY;

if(!cloud_name || !api_secret || !api_key) {
    throw new Error("Cloudinary environment variables are required")
}

cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
  });

  export default cloudinary
  