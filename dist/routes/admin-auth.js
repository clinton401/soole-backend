"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_auth_controllers_1 = require("../controllers/admin-auth-controllers");
const admin = (0, express_1.Router)();
admin.post("/login", admin_auth_controllers_1.login);
admin.post("/register", admin_auth_controllers_1.register);
exports.default = admin;
