"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paystack_controllers_1 = require("../controllers/paystack-controllers");
const paystack = (0, express_1.Router)();
paystack.post("/webhook", paystack_controllers_1.paystackWebhook);
paystack.get("/banks", paystack_controllers_1.getBanks);
exports.default = paystack;
