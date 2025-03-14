"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModel = exports.TransactionStructure = exports.TransactionStatus = exports.TransactionType = void 0;
const config_1 = require("../config");
var TransactionType;
(function (TransactionType) {
    TransactionType["RIDE_PAYMENT"] = "RIDE_PAYMENT";
    TransactionType["WALLET_FUNDING"] = "WALLET_FUNDING";
    // WITHDRAWAL = "WITHDRAWAL",
    TransactionType["REFUND"] = "REFUND";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["SUCCESS"] = "SUCCESS";
    TransactionStatus["FAILED"] = "FAILED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
exports.TransactionStructure = {
    space: "Transaction",
    description: "A Record Space for User Transactions",
    structure: {
        userId: {
            description: "ID of the User making the transaction",
            required: true,
            type: String,
        },
        amount: {
            description: "Transaction amount (in lowest currency unit, e.g., kobo)",
            required: true,
            type: Number,
        },
        currency: {
            description: "Transaction currency (e.g., NGN, USD)",
            required: true,
            type: String,
        },
        type: {
            description: "Type of transaction (e.g., RIDE_PAYMENT, WALLET_FUNDING)",
            required: true,
            type: String,
        },
        status: {
            description: "Transaction status (PENDING, SUCCESS, FAILED)",
            required: true,
            type: String,
        },
        reference: {
            description: "Unique reference for this transaction",
            required: true,
            type: String,
        },
        authorizationCode: {
            description: "Authorization code for saved cards (if applicable)",
            required: false,
            type: String,
        },
        rideId: {
            description: "ID of the related ride (if applicable)",
            required: false,
            type: String,
        },
    },
};
exports.TransactionModel = (0, config_1.createRowSchema)(exports.TransactionStructure);
