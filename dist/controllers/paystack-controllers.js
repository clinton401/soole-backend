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
exports.paystackWebhook = void 0;
const dotenv_1 = require("dotenv");
const http_errors_1 = __importDefault(require("http-errors"));
const payout_1 = require("../nobox/record-structures/payout");
const wallet_1 = require("../nobox/record-structures/wallet");
const transaction_1 = require("../nobox/record-structures/transaction");
const wallet_2 = require("../data/wallet");
const crypto_1 = __importDefault(require("crypto"));
const __1 = require("..");
(0, dotenv_1.config)();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key is required");
}
const PAYSTACK_BASE_URL = "https://api.paystack.co";
const paystackHeaders = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
};
const paystackWebhook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Verify webhook signature
        const hash = crypto_1.default.createHmac("sha512", PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest("hex");
        if (hash !== req.headers["x-paystack-signature"]) {
            return next((0, http_errors_1.default)(401, "Unauthorized webhook request."));
        }
        const event = req.body;
        // console.log("Paystack webhook received:", event);
        if (event.event === "charge.success") {
            const reference = event.data.reference;
            const transaction = yield transaction_1.TransactionModel.findOne({ reference });
            if (!transaction) {
                return next((0, http_errors_1.default)(404, "Transaction not found."));
            }
            if (transaction.status === transaction_1.TransactionStatus.SUCCESS) {
                res.status(200).json({ success: true, message: "Transaction already processed." });
                return;
            }
            const updatedTransaction = yield transaction_1.TransactionModel.updateOneById(transaction.id, {
                status: transaction_1.TransactionStatus.SUCCESS,
            });
            if (!updatedTransaction) {
                return next((0, http_errors_1.default)(500, "Failed to update transaction status."));
            }
            __1.io.emit('transaction:update', updatedTransaction);
            const wallet = yield (0, wallet_2.findWalletByUserId)(transaction.userId);
            if (!wallet) {
                return next((0, http_errors_1.default)(404, "No wallet found for this user."));
            }
            if (wallet.status === wallet_1.WalletStatus.SUSPENDED) {
                return next((0, http_errors_1.default)(400, "Wallet is suspended. Please contact support."));
            }
            const updatedWallet = yield (0, wallet_2.addToUserWalletBalance)(wallet, transaction, (_a = event.data.authorization) === null || _a === void 0 ? void 0 : _a.authorization_code);
            // io.emit("wallet:funded", updatedWallet);
            // io.emit("transaction:success", updatedTransaction);
            res.status(200).json({
                success: true,
                message: "Wallet funded successfully via webhook.",
                wallet: updatedWallet,
            });
            return;
        }
        if (event.event === "charge.failed") {
            const reference = event.data.reference;
            const transaction = yield transaction_1.TransactionModel.findOne({ reference });
            if (!transaction) {
                return next((0, http_errors_1.default)(404, "Transaction not found."));
            }
            if (transaction.status === transaction_1.TransactionStatus.FAILED) {
                res.status(200).json({ success: true, message: "Transaction already marked as failed." });
                return;
            }
            // Update transaction status to FAILED
            const updatedTransaction = yield transaction_1.TransactionModel.updateOneById(transaction.id, {
                status: transaction_1.TransactionStatus.FAILED,
            });
            if (!updatedTransaction) {
                return next((0, http_errors_1.default)(500, "Failed to update transaction status."));
            }
            // Emit WebSocket event for UI updates
            __1.io.emit("transaction:update", updatedTransaction);
            res.status(200).json({
                success: true,
                message: "Transaction marked as failed.",
                transaction: updatedTransaction,
            });
            return;
        }
        if (event.event === "transfer.success") {
            const transferReference = event.data.reference;
            const payout = yield payout_1.PayoutModel.findOne({ reference: transferReference });
            if (!payout) {
                return next((0, http_errors_1.default)(404, "Transfer record not found."));
            }
            if (payout.status === payout_1.PayoutStatus.SUCCESSFUL) {
                res.status(200).json({ success: true, message: "Transfer already processed." });
                return;
            }
            const updatedPayout = yield payout_1.PayoutModel.updateOneById(payout.id, { status: payout_1.PayoutStatus.SUCCESSFUL });
            if (updatedPayout) {
                __1.io.emit("payout:update", updatedPayout);
            }
            const wallet = yield (0, wallet_2.findWalletByUserId)(payout.userId);
            if (!wallet) {
                return next((0, http_errors_1.default)(404, "No wallet found for this user."));
            }
            if (wallet.status === wallet_1.WalletStatus.SUSPENDED) {
                return next((0, http_errors_1.default)(400, "Wallet is suspended. Please contact support."));
            }
            if (wallet.balance < payout.amount) {
                return next((0, http_errors_1.default)(400, "Insufficient funds in your wallet to complete this transfer"));
            }
            yield (0, wallet_2.deductFromWallet)(wallet.id, payout.amount, wallet.balance);
            res.status(200).json({ success: true, message: "Transfer successfully processed." });
            return;
        }
        if (event.event === "transfer.failed") {
            // console.log("Fund transfer failed:", event.data);
            const transferReference = event.data.reference;
            const payout = yield payout_1.PayoutModel.findOne({ reference: transferReference });
            if (!payout) {
                return next((0, http_errors_1.default)(404, "Transfer record not found."));
            }
            const updatedPayout = yield payout_1.PayoutModel.updateOneById(payout.id, { status: payout_1.PayoutStatus.FAILED });
            if (updatedPayout) {
                __1.io.emit("payout:update", updatedPayout);
            }
            res.status(200).json({ success: true, message: "Transfer marked as failed, and user refunded." });
            return;
        }
        res.status(200).json({ success: true, message: "Event received, but not processed." });
    }
    catch (error) {
        console.error("Paystack Webhook Error:", error);
        return next((0, http_errors_1.default)(500, "An error occurred while processing the webhook."));
    }
});
exports.paystackWebhook = paystackWebhook;
