import { Space } from "nobox-client";
import { createRowSchema } from "../config";

interface PaymentMethod {
    cardNumber: string;
    cvv: string;
    expiryDate: string;
    userId: string;

}

export const PaymentMethodStructure: Space<PaymentMethod> = {
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
}

export const PaymentMethodModel = createRowSchema<PaymentMethod>(PaymentMethodStructure);