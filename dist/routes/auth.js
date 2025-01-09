"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = require("../controllers/auth-controllers");
// import upload from "../middlewares/upload"
const auth = (0, express_1.Router)();
auth.post("/register", auth_controllers_1.register);
auth.post("/login", auth_controllers_1.login);
auth.post("/send-reset-code", auth_controllers_1.sendResetCode);
auth.post("/verify-reset-code/:id", auth_controllers_1.verififyResetCode);
auth.post("/reset-password/:id", auth_controllers_1.resetPassword);
auth.post("/verify-number/:id", auth_controllers_1.verifyNumber);
auth.post("/regenerate-code/:id", auth_controllers_1.regenerateVerificationCode);
// auth.post("/upload-image", upload.single('image'), uploadImage);
auth.put("/complete-profile/:id", auth_controllers_1.completeProfile);
exports.default = auth;
