"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_secret = process.env.CLOUDINARY_API_SECRET;
const api_key = process.env.CLOUDINARY_API_KEY;
if (!cloud_name || !api_secret || !api_key) {
    throw new Error("Cloudinary environment variables are required");
}
cloudinary_1.v2.config({
    cloud_name,
    api_key,
    api_secret,
});
exports.default = cloudinary_1.v2;
