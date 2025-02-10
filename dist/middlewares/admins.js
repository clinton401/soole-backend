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
exports.checkSuperAdmin = void 0;
const variables_1 = require("../lib/variables");
const http_errors_1 = __importDefault(require("http-errors"));
const admin_1 = require("../data/admin");
const admin_2 = require("../nobox/record-structures/admin");
const checkSuperAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    try {
        const admin = yield (0, admin_1.findAdminById)(userId);
        if (!admin) {
            return next((0, http_errors_1.default)(404, "Admin not found."));
        }
        if (admin.role !== admin_2.AdminRole.SUPER_ADMIN) {
            return next((0, http_errors_1.default)(403, "Access denied. Only super admins can perform this action."));
        }
        next();
    }
    catch (error) {
        console.error(`Unable to check if an admin is a super admin`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.checkSuperAdmin = checkSuperAdmin;
