"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controllers_1 = require("../controllers/transaction-controllers");
const transaction = (0, express_1.Router)();
transaction.get("/", transaction_controllers_1.getTransactions);
exports.default = transaction;
