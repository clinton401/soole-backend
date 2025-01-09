import { Router } from "express";
import { register, verifyNumber, regenerateVerificationCode, completeProfile, login, sendResetCode, verififyResetCode, resetPassword } from "../controllers/auth-controllers";
// import upload from "../middlewares/upload"
const auth = Router();

auth.post("/register", register);
auth.post("/login", login);
auth.post("/send-reset-code", sendResetCode);
auth.post("/verify-reset-code/:id", verififyResetCode);
auth.post("/reset-password/:id", resetPassword);
auth.post("/verify-number/:id", verifyNumber);

auth.post("/regenerate-code/:id", regenerateVerificationCode);
// auth.post("/upload-image", upload.single('image'), uploadImage);
auth.put("/complete-profile/:id", completeProfile);


export default auth