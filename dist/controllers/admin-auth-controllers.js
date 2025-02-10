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
exports.login = exports.register = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const variables_1 = require("../lib/variables");
const index_1 = require("../schemas/index");
const utils_1 = require("../lib/utils");
const zod_1 = require("zod");
const admin_1 = require("../data/admin");
const password_utils_1 = require("../lib/password-utils");
const access_tokens_1 = require("../middlewares/access-tokens");
const admin_request_1 = require("../data/admin-request");
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const values = req.body;
    try {
        const validatedData = index_1.RegisterAdminSchema.parse(values);
        const { personalEmail, phone, password, username, workEmail } = validatedData;
        const uniqueError = yield (0, admin_1.validateUniqueAdminIdentifiers)(personalEmail.toLowerCase(), phone, username.toLowerCase());
        if (uniqueError) {
            return next((0, http_errors_1.default)(400, uniqueError));
        }
        const hashedPassword = yield (0, password_utils_1.hashPassword)(password);
        const data = Object.assign(Object.assign({}, validatedData), { password: hashedPassword, personalEmail: personalEmail.toLowerCase(), workEmail: workEmail.toLowerCase(), username: username.toLowerCase(), adminViewable: true });
        yield (0, admin_request_1.createAdminRequest)(Object.assign({}, data));
        res.status(201).json({ status: "success", message: "Admin request submitted! You'll receive an email once it's reviewed." });
    }
    catch (error) {
        console.error(`Unable to send admin request: ${error}`);
        if (error instanceof zod_1.ZodError) {
            const errors = (0, utils_1.zodErrorHandler)(error);
            res.status(400).json({
                success: false,
                error: errors,
            });
            return;
        }
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { contactInfo, password } = req.body;
    if (!password || !contactInfo) {
        return next((0, http_errors_1.default)(400, "Incomplete credentials"));
    }
    try {
        const admin = yield (0, admin_1.checkAdminExists)(contactInfo);
        if (!admin) {
            return next((0, http_errors_1.default)(404, variables_1.admin_not_found));
        }
        const isPasswordValid = yield (0, password_utils_1.validatePassword)(password, admin.password);
        if (!isPasswordValid) {
            return next((0, http_errors_1.default)(401, "Invalid credentials. Check password and try again"));
        }
        const access_token = (0, access_tokens_1.generateAccessToken)(admin.id);
        res.status(200).json({ status: "success", message: "Login successful.", admin: (0, utils_1.userHandler)(admin), access_token });
    }
    catch (error) {
        console.error(`Unable to login admin: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.login = login;
