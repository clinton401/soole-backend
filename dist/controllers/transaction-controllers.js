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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactions = void 0;
const transaction_1 = require("../nobox/record-structures/transaction");
const http_errors_1 = __importDefault(require("http-errors"));
const variables_1 = require("../lib/variables");
const utils_1 = require("../lib/utils");
const getTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { page } = req.query;
    const userId = req.userId;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    const currentPage = Math.max(1, Number(page) || 1);
    try {
        const options = (0, utils_1.paginationOptions)();
        const transactions = yield transaction_1.TransactionModel.find({ userId }, options);
        if (!transactions) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const pageSize = 15;
        const data = (0, utils_1.getUserPageInfo)(transactions, pageSize, currentPage, "transactions");
        res.json({
            status: "success",
            message: "Transactions retreived successfully",
            data
        });
    }
    catch (error) {
        console.error(`Unable to get user's transactions: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getTransactions = getTransactions;
