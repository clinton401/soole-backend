import { Space } from "nobox-client";
import { createRowSchema } from "../config";

export interface AdminRequest {
    phone: string;
    username: string;
    password: string;
    workEmail: string;
    personalEmail: string;
    adminViewable: boolean;
}

export const AdminRequestStructure: Space<AdminRequest> = {
    space: "Admin-Request",
    description: "A Record Space for admin requests",
    structure: {
        adminViewable: {
            description: "Is row visible to admins",
            required: true,
            type: Boolean
        },
        phone: {
            description: "Admin's Phone Number",
            required: true,
            type: String,
        },
        password: {
            description: "Admin's Password",
            required: true,
            type: String,
            // hashed: true
        },



        workEmail: {
            description: "Admin's Work Email Address",
            required: true,
            type: String,
        },
        personalEmail: {
            description: "Admin's Personal Email Address",
            required: true,
            type: String,
        },
        username: {
            description: "Admin username",
            required: true,
            type: String
        }

    },
};

export const AdminRequestModel = createRowSchema<AdminRequest>(AdminRequestStructure);
