import { Space } from "nobox-client";
import { createRowSchema } from "../config";

export enum PayoutStatus {
    PENDING = "PENDING",
    SUCCESSFUL = "SUCCESSFUL",
    FAILED = "FAILED"
}

export enum PayoutType {
    WITHDRAWAL = "WITHDRAWAL",
    RIDE_PAYMENT = "RIDE_PAYMENT"
}

interface Payout {
    userId: string;
    rideId?: string;
    requesterId: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    amount: number;
    userName: string;
    status: PayoutStatus;
    type: PayoutType;
    reference?: string;
    adminViewable: boolean
}

export const PayoutStructure: Space<Payout> = {
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

export const PayoutModel = createRowSchema<Payout>(PayoutStructure);
