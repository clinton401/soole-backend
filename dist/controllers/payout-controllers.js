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
exports.getDriverPayouts = void 0;
const payout_1 = require("../nobox/record-structures/payout");
const utils_1 = require("../lib/utils");
const http_errors_1 = __importDefault(require("http-errors"));
const variables_1 = require("../lib/variables");
const getDriverPayouts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { page } = req.query;
    const userId = req.userId;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    const currentPage = Math.max(1, Number(page) || 1);
    try {
        const options = (0, utils_1.paginationOptions)();
        const payouts = yield payout_1.PayoutModel.find({
            userId
        }, options);
        if (!payouts) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const pageSize = 15;
        const data = (0, utils_1.getUserPageInfo)(payouts, pageSize, currentPage, "payouts");
        res.json({
            status: "success",
            message: "Payouts received successfully",
            data
        });
    }
    catch (error) {
        console.error(`Unable to get driver's payouts: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getDriverPayouts = getDriverPayouts;
