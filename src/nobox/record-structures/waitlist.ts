import { Space } from "nobox-client";
import { createRowSchema } from "../config";

export interface Waitlist {
    email: string;
}

export const WaitlistStructure: Space<Waitlist> = {
    space: "Waitlist",
    description: "A Record Space for waitlist",
    structure: {
        email: {
            description: "Email of the user",
            required: true,
            type: String
        }
    },
};

export const WaitlistModel = createRowSchema<Waitlist>(WaitlistStructure);
