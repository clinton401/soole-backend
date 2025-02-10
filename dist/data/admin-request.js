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
exports.deleteAdminRequestById = exports.findAdminRequestById = exports.createAdminRequest = void 0;
const admin_request_1 = require("../nobox/record-structures/admin-request");
const variables_1 = require("../lib/variables");
const createAdminRequest = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = yield admin_request_1.AdminRequestModel.insertOne(data);
        if (!admin) {
            throw new Error(variables_1.unknown_error);
        }
        return admin;
    }
    catch (error) {
        throw error;
    }
});
exports.createAdminRequest = createAdminRequest;
const findAdminRequestById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = yield admin_request_1.AdminRequestModel.findOne({ id });
        return request;
    }
    catch (error) {
        throw error;
    }
});
exports.findAdminRequestById = findAdminRequestById;
const deleteAdminRequestById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield admin_request_1.AdminRequestModel.deleteOneById(id);
    }
    catch (error) {
        throw error;
    }
});
exports.deleteAdminRequestById = deleteAdminRequestById;
