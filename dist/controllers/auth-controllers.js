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
exports.resetPassword = exports.verififyResetCode = exports.sendResetCode = exports.login = exports.completeProfile = exports.uploadImage = exports.regenerateVerificationCode = exports.verifyNumber = exports.register = void 0;
const schemas_1 = require("../schemas");
const http_errors_1 = __importDefault(require("http-errors"));
const user_1 = require("../nobox/record-structures/user");
const utils_1 = require("../lib/utils");
const variables_1 = require("../lib/variables");
const number_verification_1 = require("../nobox/record-structures/number-verification");
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
const zod_1 = require("zod");
const password_utils_1 = require("../lib/password-utils");
const access_tokens_1 = require("../middlewares/access-tokens");
const reset_code_1 = require("../nobox/record-structures/reset-code");
const wallet_1 = require("../nobox/record-structures/wallet");
const wallet_2 = require("../data/wallet");
const send_sms_1 = require("../config/send-sms");
const nobox_upload_1 = require("../config/nobox-upload");
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
        const today = new Date();
        // today.setDate(today.getDate() - 1);
        const analyticsDate = (0, utils_1.dateToInt)(today);
        const dayOfCreation = (0, utils_1.getDayOfWeek)();
        const weekOfCreation = (0, utils_1.getWeekNumber)();
        const user = yield user_1.UserModel.insertOne(Object.assign(Object.assign({}, validatedFields.data), { isNumberVerified: false, totalTrips: 0, totalRides: 0, status: user_1.UserStatus.ACTIVE, analyticsDate, weekOfCreation, dayOfCreation, adminViewable: true }));
        if (!user)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        const walletExists = yield (0, wallet_2.findWalletByUserId)(user.id);
        if (!walletExists) {
            yield (0, wallet_2.createWallet)(user.id, wallet_1.WalletType.USER);
        }
        const driverWalletExists = yield (0, wallet_2.findWalletByUserId)(user.id, wallet_1.WalletType.DRIVER);
        if (!driverWalletExists) {
            yield (0, wallet_2.createWallet)(user.id, wallet_1.WalletType.DRIVER);
        }
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
        const body = `Your Soole verification number is ${code}. This number will expire in 10 minutes. If you didn’t request this, please disregard this message.`;
        (0, send_sms_1.sendSMS)(body, user.phone);
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
        const body = `Your Soole verification number is ${code}. This number will expire in 10 minutes. If you didn’t request this, please disregard this message.`;
        //  twillio(body, validPhone);
        (0, send_sms_1.sendSMS)(body, user.phone);
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
        const file = req === null || req === void 0 ? void 0 : req.file;
        if (!file) {
            return next((0, http_errors_1.default)(400, "No image uploaded"));
        }
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return next((0, http_errors_1.default)(400, 'Invalid file type. Only images are allowed.'));
        }
        const filePath = file.path;
        const fileBuffer = fs_1.default.readFileSync(filePath);
        const convertedFile = new File([fileBuffer], file.originalname, { type: file.mimetype });
        const result = yield (0, nobox_upload_1.noboxUpload)(convertedFile);
        fs_1.default.unlink(filePath, (err) => {
            if (err) {
                console.error(`Failed to delete file: ${filePath}. Error: ${err.message}`);
            }
        });
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully!',
            data: {
                url: result.s3Link,
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
        const isEmailTaken = yield user_1.UserModel.findOne({ email: validatedData.email.toLowerCase() });
        if (isEmailTaken)
            return next((0, http_errors_1.default)(400, "Email already registered. Please use a different one"));
        const { confirmPassword } = validatedData, cleanedData = __rest(validatedData, ["confirmPassword"]);
        const hashedPassword = yield (0, password_utils_1.hashPassword)(cleanedData.password);
        const dataToBeUpdated = Object.assign(Object.assign({}, cleanedData), { email: validatedData.email.toLowerCase(), username: validatedData.username.toLowerCase(), password: hashedPassword });
        const updatedUser = yield user_1.UserModel.updateOneById(userId, dataToBeUpdated);
        if (!updatedUser)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        const access_token = (0, access_tokens_1.generateAccessToken)(updatedUser.id);
        res.status(200).json({
            success: true,
            message: "User profile updated successfully.",
            user: (0, utils_1.userHandler)(updatedUser),
            access_token
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
    const { password, contactInfo } = req.body;
    if (!password || !contactInfo) {
        return next((0, http_errors_1.default)(400, "Incomplete credentials"));
    }
    try {
        let user;
        const options = {
            paramRelationship: 'Or',
        };
        user = yield user_1.UserModel.findOne({ phone: contactInfo }, {});
        if (!user) {
            user = yield user_1.UserModel.findOne({ email: contactInfo.toLowerCase() }, {});
        }
        if (!user) {
            return next((0, http_errors_1.default)(400, "User not found. Check phone number or email and try again."));
        }
        if (!user.isNumberVerified) {
            const { code, expiresAt } = (0, utils_1.otpGenerator)();
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
            const body = `Your Soole verification number is ${code}. This number will expire in 10 minutes. If you didn’t request this, please disregard this message.`;
            (0, send_sms_1.sendSMS)(body, user.phone);
            res.status(400).json({ error: "Phone number not verified. Please verify to continue.", code: 400, user_id: user.id });
            return;
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
const sendResetCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { contactInfo } = req.body;
    if (!contactInfo) {
        return next((0, http_errors_1.default)(400, "Either email or phone number is required."));
    }
    try {
        let user;
        user = yield user_1.UserModel.findOne({ phone: contactInfo }, {});
        if (!user) {
            user = yield user_1.UserModel.findOne({ email: contactInfo.toLowerCase() }, {});
        }
        if (!user) {
            return next((0, http_errors_1.default)(400, "User not found. Check phone number or email and try again."));
        }
        const { code, expiresAt } = (0, utils_1.otpGenerator)();
        const isCodeAvailable = yield reset_code_1.ResetCodeModel.findOne({ userId: user.id });
        if (!isCodeAvailable) {
            const body = {
                code,
                expiresAt: expiresAt.toISOString(),
                userId: user.id,
            };
            yield reset_code_1.ResetCodeModel.insertOne(body);
        }
        else {
            yield reset_code_1.ResetCodeModel.updateOneById(isCodeAvailable.id, {
                code,
                expiresAt: expiresAt.toISOString(),
            });
        }
        const body = `Your Soole password reset number is ${code}. This number will expire in 10 minutes. If you didn’t request this, please disregard this message.`;
        //  twillio(body, validPhone);
        (0, send_sms_1.sendSMS)(body, user.phone);
        const message = `Reset code sent to ${contactInfo}.`;
        res.status(200).json({
            status: "success",
            message,
            user: (0, utils_1.userHandler)(user)
        });
    }
    catch (error) {
        console.error(`Unable send reset: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.sendResetCode = sendResetCode;
const verififyResetCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const { code } = req.body;
    if (!code)
        return next((0, http_errors_1.default)(400, "Reset code is required"));
    try {
        const foundToken = yield reset_code_1.ResetCodeModel.findOne({ userId });
        if (!foundToken)
            return next((0, http_errors_1.default)(400, "User not found."));
        const isExpired = (0, utils_1.hasExpired)(new Date(foundToken.expiresAt));
        if (isExpired)
            return next((0, http_errors_1.default)(400, "Code has expired, generate a new one"));
        const isCodeValid = code === foundToken.code;
        if (!isCodeValid)
            return next((0, http_errors_1.default)(400, "Invalid code"));
        yield reset_code_1.ResetCodeModel.deleteOneById(foundToken.id);
        res.status(200).json({
            status: "success",
            message: "Reset code verified successfully. "
        });
    }
    catch (error) {
        console.error(`Unable verify reset code: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.verififyResetCode = verififyResetCode;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const { newPassword, confirmPassword } = req.body;
    if (!newPassword || !confirmPassword)
        return next((0, http_errors_1.default)(400, "New password and confirm password are required"));
    if (newPassword !== confirmPassword) {
        return next((0, http_errors_1.default)(400, "Passwords do not match."));
    }
    try {
        const user = yield user_1.UserModel.findOne({ id: userId });
        if (!user)
            return next((0, http_errors_1.default)(400, "No user found"));
        if (!(user === null || user === void 0 ? void 0 : user.password)) {
            return next((0, http_errors_1.default)(404, "No password found for this user."));
        }
        if (newPassword.length < 6)
            return next((0, http_errors_1.default)(400, "Password must be at least 6 characters long."));
        const isPasswordTheSameAsLastOne = yield (0, password_utils_1.validatePassword)(newPassword, user.password);
        if (isPasswordTheSameAsLastOne)
            return next((0, http_errors_1.default)(400, "New password cannot be the same as the current one"));
        const hashedPassword = yield (0, password_utils_1.hashPassword)(newPassword);
        yield user_1.UserModel.updateOneById(user.id, { password: hashedPassword });
        res.status(200).json({
            status: "success",
            message: "Password changed successfully",
        });
    }
    catch (error) {
        console.error(`Unable reset user password: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.resetPassword = resetPassword;
