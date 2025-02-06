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
exports.reactivateUser = exports.suspendUser = exports.getAllUsersForAdmin = void 0;
const user_1 = require("../nobox/record-structures/user");
const variables_1 = require("../lib/variables");
const utils_1 = require("../lib/utils");
const http_errors_1 = __importDefault(require("http-errors"));
const getAllUsersForAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { filter, page } = req.query;
    const validFilters = ['active', 'inactive', 'deactivated', "suspended"];
    const selectedFilter = filter && validFilters.includes(filter.toLowerCase()) ? filter.toLowerCase() : 'active';
    const status = selectedFilter.toUpperCase();
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = 15;
    try {
        const options = (0, utils_1.adminPaginationOptions)(currentPage, pageSize);
        const users = yield user_1.UserModel.find({ status }, options);
        if (!users) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const { totalLength: totalUsers, totalPages, nextPage } = (0, utils_1.getPageInfo)(users, pageSize, currentPage);
        res.json({
            status: "success",
            message: "Users found successfully",
            data: {
                users,
                totalUsers,
                totalPages,
                currentPage,
                nextPage
            }
        });
    }
    catch (error) {
        console.error(`Unable to get all users for admin: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getAllUsersForAdmin = getAllUsersForAdmin;
const suspendUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const user = yield user_1.UserModel.findOne({ id: userId });
        if (!user) {
            return next((0, http_errors_1.default)(404, "User not found."));
        }
        if (user.status === user_1.UserStatus.DEACTIVATED) {
            return next((0, http_errors_1.default)(403, "Cannot suspend a deactivated account."));
        }
        if (user.status === user_1.UserStatus.SUSPENDED) {
            return next((0, http_errors_1.default)(403, "This account is already suspended."));
        }
        const updatedUser = yield user_1.UserModel.updateOneById(user.id, {
            status: user_1.UserStatus.SUSPENDED
        });
        if (!updatedUser) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        res.json({
            status: "success",
            message: "Account suspended successsfully",
            user: updatedUser
        });
    }
    catch (error) {
        console.error(`Unable to suspend user: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.suspendUser = suspendUser;
const reactivateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const user = yield user_1.UserModel.findOne({ id: userId });
        if (!user) {
            return next((0, http_errors_1.default)(404, "User not found."));
        }
        if (user.status === user_1.UserStatus.ACTIVE) {
            return next((0, http_errors_1.default)(403, "This account is already active."));
        }
        const updatedUser = yield user_1.UserModel.updateOneById(user.id, {
            status: user_1.UserStatus.ACTIVE
        });
        if (!updatedUser) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        res.json({
            status: "success",
            message: "Account successfully reactivated.",
            user: updatedUser
        });
    }
    catch (error) {
        console.error(`Unable to reactivate user: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.reactivateUser = reactivateUser;
