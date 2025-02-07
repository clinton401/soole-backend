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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdminExists = exports.findAdmin = exports.findAdminById = exports.createAdmin = exports.validateUniqueAdminIdentifiers = void 0;
const admin_1 = require("../nobox/record-structures/admin");
const variables_1 = require("../lib/variables");
const utils_1 = require("../lib/utils");
const validateUniqueAdminIdentifiers = (personalEmail, phone, username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!personalEmail && !phone && !username) {
            return "At least one field is required";
        }
        if (personalEmail) {
            const isEmailTaken = yield admin_1.AdminModel.findOne({ personalEmail: personalEmail.toLowerCase() });
            if (isEmailTaken) {
                return "Personal email is already in use.";
            }
        }
        if (phone) {
            const isPhoneTaken = yield admin_1.AdminModel.findOne({ phone });
            if (isPhoneTaken) {
                return "Phone number is already in use.";
            }
        }
        if (username) {
            const isUsernameTaken = yield admin_1.AdminModel.findOne({ username: username.toLowerCase() });
            if (isUsernameTaken) {
                return "Username is already in use.";
            }
        }
        return null;
    }
    catch (error) {
        console.error(`Unable to validate admin identifiers' uniqueness: ${error}`);
        return "An unknown error occurred while validating admin identifiers.";
    }
});
exports.validateUniqueAdminIdentifiers = validateUniqueAdminIdentifiers;
const createAdmin = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = yield admin_1.AdminModel.insertOne(data);
        if (!admin) {
            throw new Error(variables_1.unknown_error);
        }
        return admin;
    }
    catch (error) {
        throw error;
    }
});
exports.createAdmin = createAdmin;
const findAdminById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = yield admin_1.AdminModel.findOne({ id }, {});
        return admin;
    }
    catch (error) {
        throw error;
    }
});
exports.findAdminById = findAdminById;
const findAdmin = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (data = {}) {
    try {
        if (!(0, utils_1.hasAtLeastOneProperty)(data)) {
            throw new Error("User data can not be empty");
        }
        const admin = yield admin_1.AdminModel.findOne(data, {});
        return admin;
    }
    catch (error) {
        throw error;
    }
});
exports.findAdmin = findAdmin;
const checkAdminExists = (info) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let admin = null;
        admin = yield admin_1.AdminModel.findOne({ phone: info });
        if (!admin) {
            admin = yield admin_1.AdminModel.findOne({ personalEmail: info });
        }
        return admin;
    }
    catch (error) {
        throw error;
    }
});
exports.checkAdminExists = checkAdminExists;
