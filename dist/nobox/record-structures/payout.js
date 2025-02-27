"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutModel = exports.PayoutStructure = exports.PayoutType = exports.PayoutStatus = void 0;
const config_1 = require("../config");
var PayoutStatus;
(function (PayoutStatus) {
    PayoutStatus["PENDING"] = "PENDING";
    PayoutStatus["SUCCESSFUL"] = "SUCCESSFUL";
    PayoutStatus["FAILED"] = "FAILED";
})(PayoutStatus || (exports.PayoutStatus = PayoutStatus = {}));
var PayoutType;
(function (PayoutType) {
    PayoutType["WITHDRAWAL"] = "WITHDRAWAL";
    PayoutType["RIDE_PAYMENT"] = "RIDE_PAYMENT";
})(PayoutType || (exports.PayoutType = PayoutType = {}));
exports.PayoutStructure = {
    space: "Payout-Records",
    description: "A Record Space for ride payouts and withdrawals",
    structure: {
        userId: {
            description: "Unique identifier of the user receiving the payout",
            type: String,
            required: true
        },
        rideId: {
            description: "Unique identifier of the ride",
            type: String,
            required: false
        },
        requesterId: {
            description: "Unique identifier of the user who requested the ride",
            type: String,
            required: true
        },
        pickupLocation: {
            description: "Pickup location for the ride",
            type: String,
            required: false
        },
        dropoffLocation: {
            description: "Drop-off location for the ride",
            type: String,
            required: false
        },
        amount: {
            description: "Amount involved in the payout",
            type: Number,
            required: true
        },
        userName: {
            description: "User's name associated with the payout",
            type: String,
            required: true
        },
        status: {
            description: "Status of the payout transaction",
            type: String,
            required: true
        },
        type: {
            description: "Type of payout transaction",
            type: String,
            required: true
        },
        reference: {
            description: "Unique reference for this transfer",
            required: false,
            type: String,
        },
        adminViewable: {
            description: "Is viewable by admin",
            required: true,
            type: Boolean,
        },
    }
};
exports.PayoutModel = (0, config_1.createRowSchema)(exports.PayoutStructure);
