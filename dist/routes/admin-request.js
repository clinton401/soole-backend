"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_request_controllers_1 = require("../controllers/admin-request-controllers");
const adminRequest = (0, express_1.Router)();
adminRequest.get("/", admin_request_controllers_1.getAdminRequests);
adminRequest.put("/:id/accept", admin_request_controllers_1.acceptAdminRequest);
adminRequest.put("/:id/reject", admin_request_controllers_1.rejectAdminRequest);
exports.default = adminRequest;
