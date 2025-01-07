import { Space } from "nobox-client";
import { createRowSchema } from "../config";

interface NumberVerification {
    code: string;
    expiresAt: string;
    userId: string;

}

export const NumberVerificationStructure: Space<NumberVerification> = {
    space: "Number-Verification",
    description: "A Record Space for phone number verification codes",
    structure: {
        code: {
            description: "Verification code",
            type: String,
            required: true
        },
        expiresAt: {
            description: "Expiration date for the verification code",
            required: true,
            type: String,
        },
        userId: {
            description: "User id for the owner of the verification code",
            required: true,
            type: String,
        },
       
    }
}

export const NumberVerificationModel = createRowSchema<NumberVerification>(NumberVerificationStructure);