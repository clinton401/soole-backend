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
exports.rejectAdminRequest = exports.acceptAdminRequest = exports.getAdminRequests = void 0;
const variables_1 = require("../lib/variables");
const admin_request_1 = require("../data/admin-request");
const http_errors_1 = __importDefault(require("http-errors"));
const admin_1 = require("../nobox/record-structures/admin");
const utils_1 = require("../lib/utils");
const admin_request_2 = require("../nobox/record-structures/admin-request");
const admin_2 = require("../data/admin");
const html_templates_1 = require("../lib/html-templates");
const mail_1 = require("../data/mail");
const getAdminRequests = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { page } = req.query;
    const currentPage = Math.max(1, Number(page) || 1);
    try {
        const options = (0, utils_1.paginationOptions)();
        const requests = yield admin_request_2.AdminRequestModel.find({}, options);
        if (!requests) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const pageSize = 15;
        const filteredRequests = requests.map(request => {
            const { password } = request, cleanedRequest = __rest(request, ["password"]);
            return cleanedRequest;
        });
        const data = (0, utils_1.getUserPageInfo)(filteredRequests, pageSize, currentPage, "requests");
        res.json({ status: "success", message: "Admin requests found successfully", data });
    }
    catch (error) {
        console.error(`Unable to get admin request: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getAdminRequests = getAdminRequests;
const acceptAdminRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const request = yield (0, admin_request_1.findAdminRequestById)(id);
        if (!request) {
            return next((0, http_errors_1.default)(404, "Admin request not found."));
        }
        const { adminViewable, id: requestId, createdAt, updatedAt } = request, cleanedAdmin = __rest(request, ["adminViewable", "id", "createdAt", "updatedAt"]);
        const uniqueError = yield (0, admin_2.validateUniqueAdminIdentifiers)(cleanedAdmin.personalEmail, cleanedAdmin.phone);
        if (uniqueError) {
            const { template, text, subject } = (0, html_templates_1.rejectionEmailTemplate)(cleanedAdmin.personalEmail, uniqueError);
            yield (0, mail_1.sendEmail)(cleanedAdmin.personalEmail, subject, text, template);
            yield (0, admin_request_1.deleteAdminRequestById)(id);
            return next((0, http_errors_1.default)(400, uniqueError));
        }
        const admin = yield (0, admin_2.createAdmin)(Object.assign(Object.assign({}, cleanedAdmin), { role: admin_1.AdminRole.ADMIN, adminViewable: true }));
        const { template, text, subject } = (0, html_templates_1.approvalEmailTemplate)(cleanedAdmin.personalEmail);
        yield (0, mail_1.sendEmail)(cleanedAdmin.personalEmail, subject, text, template);
        yield (0, admin_request_1.deleteAdminRequestById)(id);
        res.json({
            message: "Admin request approved successfully",
            status: "success",
            admin: (0, utils_1.userHandler)(admin)
        });
    }
    catch (error) {
        console.error(`Unable to accept admin request: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.acceptAdminRequest = acceptAdminRequest;
const rejectAdminRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const request = yield (0, admin_request_1.findAdminRequestById)(id);
        if (!request) {
            return next((0, http_errors_1.default)(404, "Admin request not found."));
        }
        ;
        const { template, text, subject } = (0, html_templates_1.rejectionEmailTemplate)(request.personalEmail);
        yield (0, mail_1.sendEmail)(request.personalEmail, subject, text, template);
        yield (0, admin_request_1.deleteAdminRequestById)(id);
        res.json({
            status: "success",
            message: "Admin request rejected successfully"
        });
    }
    catch (error) {
        console.error(`Unable to reject admin request: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.rejectAdminRequest = rejectAdminRequest;
