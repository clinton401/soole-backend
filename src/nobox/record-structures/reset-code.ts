import { Space } from "nobox-client";
import { createRowSchema } from "../config";

interface ResetCode {
    code: string;
    expiresAt: string;
    userId: string;

}

export const ResetCodeStructure: Space<ResetCode> = {
    space: "Reset-Code",
    description: "A Record Space for phone reset password codes",
    structure: {
        code: {
            description: "Reset code",
            type: String,
            required: true
        },
        expiresAt: {
            description: "Expiration date for the reset code",
            required: true,
            type: String,
        },
        userId: {
            description: "User id for the owner of the reset code",
            required: true,
            type: String,
        },
       
    }
}

export const ResetCodeModel = createRowSchema<ResetCode>(ResetCodeStructure);