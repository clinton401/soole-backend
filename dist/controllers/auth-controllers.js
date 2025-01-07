"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.completeProfile = exports.uploadImage = exports.regenerateVerificationCode = exports.verifyNumber = exports.register = void 0;
const schemas_1 = require("../schemas");
const http_errors_1 = __importDefault(require("http-errors"));
const user_1 = require("../nobox/record-structures/user");
const utils_1 = require("../lib/utils");
const variables_1 = require("../lib/variables");
const number_verification_1 = require("../nobox/record-structures/number-verification");
const dotenv_1 = require("dotenv");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const zod_1 = require("zod");
const password_utils_1 = require("../lib/password-utils");
const access_tokens_1 = require("../middlewares/access-tokens");
(0, dotenv_1.config)();
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const values = req.body;
    const validatedFields = schemas_1.RegisterSchema.safeParse(values);
    if (!validatedFields.success) {
        return next((0, http_errors_1.default)(400, "Phone number is required and must start with the country code (e.g. +234)."));
    }
    try {
        const { code, expiresAt } = (0, utils_1.otpGenerator)();
        const { phone } = validatedFields.data;
        const isNumberAvailable = yield user_1.UserModel.findOne({ phone });
        if (isNumberAvailable)
            return next((0, http_errors_1.default)(400, "Phone number already registered. Please use a different number or log in if you already have an account."));
        const user = yield user_1.UserModel.insertOne(Object.assign(Object.assign({}, values), { isNumberVerified: false }));
        if (!user)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        const params = {
            userId: user.id,
        };
        const isCodeAvailable = yield number_verification_1.NumberVerificationModel.findOne(params);
        if (!isCodeAvailable) {
            const body = {
                code,
                expiresAt: expiresAt.toISOString(),
                userId: user.id,
            };
            yield number_verification_1.NumberVerificationModel.insertOne(body);
        }
        else {
            yield number_verification_1.NumberVerificationModel.updateOneById(isCodeAvailable.id, {
                code,
                expiresAt: expiresAt.toISOString(),
            });
        }
        const userDetails = {
            id: user.id,
            number: user.phone
        };
        res.status(201).json({ status: "success", message: "User created successfully!. Verification code sent to your messages", user: (0, utils_1.userHandler)(user) });
    }
    catch (error) {
        console.error(`Unable to register user: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.register = register;
const verifyNumber = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const values = req.body;
    const validatedFields = schemas_1.OtpSchema.safeParse(values);
    if (!validatedFields.success) {
        return next((0, http_errors_1.default)(400, "Code is required and must be 5 characters long."));
    }
    try {
        const { code } = validatedFields.data;
        const user = yield user_1.UserModel.findOne({ id: userId });
        if (!user)
            return next((0, http_errors_1.default)(400, "User not found."));
        if (user.isNumberVerified) {
            res.status(200).json({ status: "success", message: "Phone Number has already been registered" });
            return;
        }
        const foundToken = yield number_verification_1.NumberVerificationModel.findOne({ userId });
        if (!foundToken)
            return next((0, http_errors_1.default)(400, "No verification token available for user."));
        const isExpired = (0, utils_1.hasExpired)(new Date(foundToken.expiresAt));
        if (isExpired) {
            return next((0, http_errors_1.default)(400, "Code has expired, generate a new one"));
        }
        const isCodeValid = code === foundToken.code;
        if (!isCodeValid)
            return next((0, http_errors_1.default)(400, "Invalid code"));
        const data = {
            isNumberVerified: true,
        };
        const updatedUser = yield user_1.UserModel.updateOneById(user.id, data);
        if (!updatedUser)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        yield number_verification_1.NumberVerificationModel.deleteOneById(foundToken.id);
        res.status(200).json({ status: "success", message: "Phone number verified successfully.", user: (0, utils_1.userHandler)(updatedUser) });
    }
    catch (error) {
        console.error(`Unable to verify phone number: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.verifyNumber = verifyNumber;
const regenerateVerificationCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const user = yield user_1.UserModel.findOne({ id: userId });
        if (!user)
            return next((0, http_errors_1.default)(400, "User not found."));
        if (user.isNumberVerified) {
            res.status(200).json({ status: "success", message: "Phone Number has already been registered" });
            return;
        }
        const { code, expiresAt } = (0, utils_1.otpGenerator)();
        const isCodeAvailable = yield number_verification_1.NumberVerificationModel.findOne({ userId });
        if (!isCodeAvailable) {
            const body = {
                code,
                expiresAt: expiresAt.toISOString(),
                userId,
            };
            yield number_verification_1.NumberVerificationModel.insertOne(body);
        }
        else {
            yield number_verification_1.NumberVerificationModel.updateOneById(isCodeAvailable.id, {
                code,
                expiresAt: expiresAt.toISOString(),
            });
        }
        res.status(200).json({ status: "success", message: "New verification code sent to your messages" });
    }
    catch (error) {
        console.error(`Error while regenerating verification code: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.regenerateVerificationCode = regenerateVerificationCode;
const uploadImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return next((0, http_errors_1.default)(400, "No image uploaded"));
        }
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return next((0, http_errors_1.default)(400, 'Invalid file type. Only images are allowed.'));
        }
        const upload_preset = process.env.CLOUDINARY_PRESET_NAME;
        if (!upload_preset)
            return next((0, http_errors_1.default)(400, "Cloudinary preset name is required"));
        const filePath = req.file.path;
        const result = yield cloudinary_1.default.uploader.upload(filePath, {
            upload_preset,
        });
        if (!result)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        fs_1.default.unlink(filePath, (err) => {
            if (err) {
                console.error(`Failed to delete file: ${filePath}. Error: ${err.message}`);
            }
        });
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully!',
            data: {
                url: result.secure_url,
                public_id: result.public_id
            }
        });
    }
    catch (error) {
        console.error(`Unable to upload image to cloudinary: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.unknown_error));
    }
});
exports.uploadImage = uploadImage;
const completeProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const values = req.body;
    const userId = req.params.id;
    try {
        const user = yield user_1.UserModel.findOne({ id: userId });
        if (!user)
            return next((0, http_errors_1.default)(400, "User not found."));
        if (user.email && user.password)
            return next((0, http_errors_1.default)(400, "Profile is already complete. No further updates are allowed."));
        const validatedData = schemas_1.CompleteProfileSchema.parse(values);
        const isEmailTaken = yield user_1.UserModel.findOne({ email: validatedData.email });
        if (isEmailTaken)
            return next((0, http_errors_1.default)(400, "Email already registered. Please use a different one"));
        const { confirmPassword } = validatedData, cleanedData = __rest(validatedData, ["confirmPassword"]);
        const hashedPassword = yield (0, password_utils_1.hashPassword)(cleanedData.password);
        const dataToBeUpdated = Object.assign(Object.assign({}, cleanedData), { password: hashedPassword });
        const updatedUser = yield user_1.UserModel.updateOneById(userId, dataToBeUpdated);
        if (!updatedUser)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        res.status(200).json({
            success: true,
            message: "User profile updated successfully.",
            user: (0, utils_1.userHandler)(updatedUser)
        });
    }
    catch (err) {
        console.error(`Unable to complete user profile: ${err}`);
        if (err instanceof zod_1.ZodError) {
            const errors = err.errors.map((e) => ({
                path: e.path.join("."),
                message: e.message,
            }));
            res.status(400).json({
                success: false,
                error: errors,
            });
            return;
        }
        return next((0, http_errors_1.default)(500, variables_1.unknown_error));
    }
});
exports.completeProfile = completeProfile;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, email, password } = req.body;
    if (!password || (!phone && !email)) {
        return next((0, http_errors_1.default)(400, "Incomplete credentials"));
    }
    if (phone && email) {
        return next((0, http_errors_1.default)(400, "Please provide only one of phone or email, not both."));
    }
    try {
        let user;
        if (phone) {
            if (!(0, utils_1.validatePhone)(phone)) {
                return next((0, http_errors_1.default)(400, "Phone not in correct format. Include country code."));
            }
            user = yield user_1.UserModel.findOne({ phone });
            if (!user) {
                return next((0, http_errors_1.default)(400, "User not found. Check phone number and try again."));
            }
        }
        else {
            if (!(0, utils_1.validateEmail)(email)) {
                return next((0, http_errors_1.default)(400, "Email not in correct format. Check the email address."));
            }
            user = yield user_1.UserModel.findOne({ email });
            if (!user) {
                return next((0, http_errors_1.default)(400, "User not found. Check email and try again."));
            }
        }
        if (!(user === null || user === void 0 ? void 0 : user.password)) {
            return next((0, http_errors_1.default)(404, "No password found for this user."));
        }
        const isPasswordValid = yield (0, password_utils_1.validatePassword)(password, user.password);
        if (!isPasswordValid) {
            return next((0, http_errors_1.default)(401, "Invalid credentials. Check password and try again"));
        }
        const access_token = (0, access_tokens_1.generateAccessToken)(user.id);
        res.status(200).json({ status: "success", message: "Login successful.", user: (0, utils_1.userHandler)(user), access_token });
    }
    catch (error) {
        console.error(`Unable sign in user: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.login = login;
