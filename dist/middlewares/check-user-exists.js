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
exports.checkUserExists = void 0;
const variables_1 = require("../lib/variables");
const http_errors_1 = __importDefault(require("http-errors"));
const utils_1 = require("../lib/utils");
const user_1 = require("../nobox/record-structures/user");
const checkUserExists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        req.user = user;
    }
    catch (error) {
        console.error(`Error while checking if user exists: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.checkUserExists = checkUserExists;
