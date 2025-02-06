"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controllers_1 = require("../controllers/admin-controllers");
const admin = (0, express_1.Router)();
admin.post("/login", admin_controllers_1.login);
admin.post("/register", admin_controllers_1.register);
exports.default = admin;
