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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFace = exports.kycVerification = exports.createComplaint = exports.deleteAccount = exports.resetPassword = exports.updateUserDetails = exports.getSpecificUserDetails = exports.getUserDetails = exports.getPaymentMethods = exports.deletePaymentMethod = exports.addPaymentMethod = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const user_1 = require("../nobox/record-structures/user");
const payment_method_1 = require("../nobox/record-structures/payment-method");
const variables_1 = require("../lib/variables");
const utils_1 = require("../lib/utils");
const index_1 = require("../schemas/index");
const zod_1 = require("zod");
const password_utils_1 = require("../lib/password-utils");
const complaint_conversation_1 = require("../data/complaint-conversation");
const __1 = require("..");
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const FACEPP_KEY = process.env.FACEPP_API_KEY;
const FACEPP_SECRET = process.env.FACEPP_API_SECRET;
if (!FACEPP_KEY || !FACEPP_SECRET) {
    throw new Error("Faceapp key and secret are required");
}
const addPaymentMethod = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { cardNumber, cvv, expiryDate } = req.body;
    const userId = req.userId;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    if (!cardNumber || !cvv || !expiryDate) {
        return next((0, http_errors_1.default)(400, "All fields are required."));
    }
    try {
        if (!(0, utils_1.isCreditCardValid)(cardNumber))
            return next((0, http_errors_1.default)(400, "Invalid credit card number."));
        const expiryValidationError = (0, utils_1.validateExpiryDate)(expiryDate);
        if (expiryValidationError)
            return next((0, http_errors_1.default)(400, expiryValidationError));
        if (cvv.length !== 3)
            return next((0, http_errors_1.default)(400, "CVV must be 3 digits."));
        const foundCard = yield payment_method_1.PaymentMethodModel.findOne({
            cardNumber, userId
        }, {});
        if (foundCard)
            return next((0, http_errors_1.default)(400, "Card already exists. Please use a different card."));
        const card = yield payment_method_1.PaymentMethodModel.insertOne({ cardNumber, cvv, expiryDate, userId });
        if (!card)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        res.status(201).json({ status: "success", message: 'Payment method added successfully.', card });
    }
    catch (error) {
        console.error(`Unable to add payment method: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.addPaymentMethod = addPaymentMethod;
const deletePaymentMethod = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const card = yield payment_method_1.PaymentMethodModel.findOne({ id }, {});
        if (!card)
            return next((0, http_errors_1.default)(400, "Card not found. Please check and try again."));
        yield payment_method_1.PaymentMethodModel.deleteOneById(id);
        res.status(201).json({ status: "success", message: 'Payment method deleted successfully.', });
    }
    catch (error) {
        console.error(`Unable to delete payment method: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.deletePaymentMethod = deletePaymentMethod;
const getPaymentMethods = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    console.log("get payment");
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    try {
        const cards = yield payment_method_1.PaymentMethodModel.find({ userId }, {});
        if ((cards === null || cards === void 0 ? void 0 : cards.length) < 1)
            return next((0, http_errors_1.default)(404, "No payment methods found. Please add a card to your account."));
        res.status(200).json({
            status: "success",
            message: "Payment methods retrieved successfully.",
            cards
        });
    }
    catch (error) {
        console.error(`Unable to get payment methods: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getPaymentMethods = getPaymentMethods;
const getUserDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    try {
        const user = yield user_1.UserModel.findOne({ id: userId }, {});
        if (!user)
            return next((0, http_errors_1.default)(404, "User not found."));
        res.status(200).json({
            status: "success",
            user: (0, utils_1.userHandler)(user)
        });
    }
    catch (error) {
        console.error(`Unable to get signed in user's details: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getUserDetails = getUserDetails;
const getSpecificUserDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const user = yield user_1.UserModel.findOne({ id: userId }, {});
        if (!user)
            return next((0, http_errors_1.default)(404, "User not found."));
        res.status(200).json({
            status: "success",
            user: (0, utils_1.userHandler)(user)
        });
    }
    catch (error) {
        console.error(`Unable to get ${userId} user's details: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getSpecificUserDetails = getSpecificUserDetails;
const updateUserDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    const values = req.body;
    try {
        const validatedData = index_1.UpdateProfileSchema.parse(values);
        if (!validatedData || Object.keys(validatedData).length < 1)
            return next((0, http_errors_1.default)(400, "At least one field must be provided."));
        // if (validatedData.phone) {
        //     const phoneExists = await UserModel.findOne({ phone: validatedData.phone });
        //     if (phoneExists) {
        //         return next(createError(400, "Phone number already exists."));
        //     }
        // }
        // if (validatedData.email) {
        //     const emailExists = await UserModel.findOne({ email: validatedData.email.toLowerCase() });
        //     if (emailExists) {
        //         return next(createError(400, "Email already exists."));
        //     }
        // }
        // if(validatedData.avatarUrl && !isValidImage(validatedData.avatarUrl)){
        //     return next(createError(400, "Avatar URL must be a valid image"))
        // }
        const fieldsToUpdate = Object.fromEntries(Object.entries(validatedData).filter(([key, value]) => value !== undefined));
        const validFields = Object.assign({}, fieldsToUpdate);
        const user = yield user_1.UserModel.findOne({ id: userId }, {});
        if (!user)
            return next((0, http_errors_1.default)(404, "User not found."));
        const updatedUser = yield user_1.UserModel.updateOneById(userId, validFields);
        if (!updatedUser)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        res.status(200).json({
            status: "success",
            message: "Updated user details successfully",
            user: (0, utils_1.userHandler)(updatedUser)
        });
    }
    catch (err) {
        console.error(`Unable to update signed in user's details: ${err}`);
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
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.updateUserDetails = updateUserDetails;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.userId;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    if (!oldPassword || !newPassword || !confirmPassword)
        return next((0, http_errors_1.default)(400, "All fields are required."));
    if (oldPassword.length < 6 || newPassword.length < 6 || confirmPassword.length < 6)
        return next((0, http_errors_1.default)(400, "All fields must be at least 6 characters long."));
    if (newPassword !== confirmPassword)
        return next((0, http_errors_1.default)(400, "New password and confirm password do not match."));
    try {
        const user = yield user_1.UserModel.findOne({ id: userId }, {});
        if (!user)
            return next((0, http_errors_1.default)(404, "User not found."));
        if (!(user === null || user === void 0 ? void 0 : user.password)) {
            return next((0, http_errors_1.default)(404, "No password found for this user."));
        }
        const isOldPasswordCorrect = yield (0, password_utils_1.validatePassword)(oldPassword, user.password);
        if (!isOldPasswordCorrect)
            return next((0, http_errors_1.default)(400, "The old password you entered is incorrect."));
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
        console.error(`Unable to  reset user password: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.resetPassword = resetPassword;
const deleteAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    try {
        const user = yield user_1.UserModel.findOne({ id: userId }, {});
        if (!user)
            return next((0, http_errors_1.default)(404, "User not found."));
        yield user_1.UserModel.deleteOneById(userId);
        res.status(200).json({
            status: "success",
            message: "Account deleted successfully."
        });
    }
    catch (error) {
        console.error(`Unable to  delete user account: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.deleteAccount = deleteAccount;
const createComplaint = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { message } = req.body;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    if (!message || message.length < 2) {
        return next((0, http_errors_1.default)(400, "Message is required and must be at least 2 characters long"));
    }
    try {
        const user = yield user_1.UserModel.findOne({ id: userId });
        if (!user) {
            return next((0, http_errors_1.default)(404, "User not found."));
        }
        const { firstName, lastName, email } = user;
        if (!firstName || !lastName || !email) {
            return next((0, http_errors_1.default)(400, "You need to complete your profile before submitting a complaint."));
        }
        const data = yield (0, complaint_conversation_1.createComplaintConversation)(user, message);
        __1.io.emit("complaint", data);
        res.status(201).json({
            message: "Complaint submitted successfully",
        });
    }
    catch (error) {
        console.error(`Unable to create a complaint: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.createComplaint = createComplaint;
const kycVerification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
        }
        let { nin, driverLicense } = req.body;
        console.log({ nin, driverLicense });
        if ((typeof nin !== 'string' || !nin.trim()) &&
            (typeof driverLicense !== 'string' || !driverLicense.trim())) {
            return next((0, http_errors_1.default)(400, 'At least one of NIN or Driver License must be provided'));
        }
        if (typeof nin === 'string') {
            nin = nin.trim();
            if (nin.length !== 11) {
                return next((0, http_errors_1.default)(400, 'NIN must be exactly 11 characters'));
            }
        }
        else {
            nin = undefined;
        }
        if (typeof driverLicense === 'string') {
            driverLicense = driverLicense.trim();
            if (driverLicense.length < 5) {
                return next((0, http_errors_1.default)(400, 'Driver License must be at least 5 characters'));
            }
        }
        else {
            driverLicense = undefined;
        }
        const existingUser = yield user_1.UserModel.findOne({ id: userId });
        if (!existingUser) {
            return next((0, http_errors_1.default)(404, 'User not found'));
        }
        if (nin && existingUser.nin && nin === existingUser.nin) {
            return next((0, http_errors_1.default)(400, 'NIN has already been submitted'));
        }
        if (driverLicense && existingUser.driverLicense && driverLicense === existingUser.driverLicense) {
            return next((0, http_errors_1.default)(400, 'Driver License has already been submitted'));
        }
        const updateData = {};
        if (nin && nin !== existingUser.nin)
            updateData.nin = nin;
        if (driverLicense && driverLicense !== existingUser.driverLicense)
            updateData.driverLicense = driverLicense;
        if (Object.keys(updateData).length === 0) {
            return next((0, http_errors_1.default)(400, 'No new KYC details to update'));
        }
        const updatedUser = yield user_1.UserModel.updateOneById(userId, updateData);
        res.status(200).json({ success: true, user: (0, utils_1.userHandler)(updatedUser) });
    }
    catch (error) {
        console.error(`Unable to add kyc: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.kycVerification = kycVerification;
const verifyFace = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    try {
        const user = yield user_1.UserModel.findOne({ id: userId });
        if (!user) {
            return next((0, http_errors_1.default)(404, "User not found."));
        }
        if (user.isKycVerified) {
            return next((0, http_errors_1.default)(400, "You have already completed identity verification."));
        }
        if (!user.nin) {
            return next((0, http_errors_1.default)(400, "You must submit your NIN to complete identity verification."));
        }
        const file = req === null || req === void 0 ? void 0 : req.file;
        if (!file) {
            return next((0, http_errors_1.default)(400, "No image uploaded"));
        }
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return next((0, http_errors_1.default)(400, 'Invalid file type. Only images are allowed.'));
        }
        const imagePath = path_1.default.resolve(file.path);
        const image = fs_1.default.createReadStream(imagePath);
        const formData = new form_data_1.default();
        formData.append('api_key', FACEPP_KEY);
        formData.append('api_secret', FACEPP_SECRET);
        formData.append('image_file', image);
        formData.append('return_attributes', 'age,gender,smiling,glass,headpose,facequality');
        const response = yield axios_1.default.post('https://api-us.faceplusplus.com/facepp/v3/detect', formData, { headers: formData.getHeaders() });
        fs_1.default.unlinkSync(imagePath);
        // console.log(JSON.stringify(response.data))
        const faces = response.data.faces;
        if (!faces.length) {
            return next((0, http_errors_1.default)(400, 'No face detected'));
        }
        const { age } = faces[0].attributes;
        const ageValue = age.value;
        if (ageValue < 18) {
            return next((0, http_errors_1.default)(403, 'Must be at least 18 years old'));
        }
        const date = new Date();
        const kycVerifiedAt = date.toISOString();
        const updatedUser = yield user_1.UserModel.updateOneById(userId, {
            kycVerifiedAt,
            isKycVerified: true
        });
        if (!updatedUser) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        res.json({ success: true, age: ageValue, user: (0, utils_1.userHandler)(updatedUser) });
    }
    catch (error) {
        console.error(`Unable to verify face: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.verifyFace = verifyFace;
