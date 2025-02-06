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
exports.verifyUserStatus = void 0;
const user_1 = require("../nobox/record-structures/user");
const http_errors_1 = __importDefault(require("http-errors"));
const variables_1 = require("../lib/variables");
const verifyUserStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    try {
        const user = yield user_1.UserModel.findOne({ id: userId });
        if (!user) {
            return next((0, http_errors_1.default)(404, "User not found"));
        }
        if (user.status === user_1.UserStatus.SUSPENDED || user.status === user_1.UserStatus.DEACTIVATED) {
            return next((0, http_errors_1.default)(403, "Account suspended or deactivated."));
        }
        next();
    }
    catch (error) {
        console.error(`Unable to verify user status: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.verifyUserStatus = verifyUserStatus;
