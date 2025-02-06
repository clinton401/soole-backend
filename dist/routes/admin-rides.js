"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_rides_controllers_1 = require("../controllers/admin-rides-controllers");
const adminRides = (0, express_1.Router)();
adminRides.get("/", admin_rides_controllers_1.getAllRidesForAdmin);
exports.default = adminRides;
