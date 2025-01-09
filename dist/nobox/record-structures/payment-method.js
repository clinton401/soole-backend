"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodModel = exports.PaymentMethodStructure = void 0;
const config_1 = require("../config");
exports.PaymentMethodStructure = {
    space: "Payment-Method",
    description: "A Record Space for user payment methods",
    structure: {
        cardNumber: {
            description: "Card Number",
            type: String,
            required: true
        },
        cvv: {
            description: "Card CVV",
            required: true,
            type: String,
        },
        expiryDate: {
            description: "Card expiry date",
            required: true,
            type: String,
        },
        userId: {
            description: "User id for the owner of the card",
            required: true,
            type: String,
        },
    }
};
exports.PaymentMethodModel = (0, config_1.createRowSchema)(exports.PaymentMethodStructure);
