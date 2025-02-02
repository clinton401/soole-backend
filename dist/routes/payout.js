"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payout_controllers_1 = require("../controllers/payout-controllers");
const payout = (0, express_1.Router)();
payout.get("/", payout_controllers_1.getDriverPayouts);
exports.default = payout;
