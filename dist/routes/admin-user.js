"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_user_controllers_1 = require("../controllers/admin-user-controllers");
const adminUser = (0, express_1.Router)();
adminUser.get("/", admin_user_controllers_1.getAllUsersForAdmin);
exports.default = adminUser;
