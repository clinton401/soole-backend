import { Space } from "nobox-client";
import { createRowSchema } from "../config";
export enum AdminRole {
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN"
}
export interface Admin {
  phone: string;
  name: string;
  password: string;
  workEmail: string;
  role: AdminRole;
  personalEmail: string;
  avatarUrl?: string;
  adminViewable: boolean;
}

export const AdminStructure: Space<Admin> = {
  space: "Admin",
  description: "A Record Space for admins",
  structure: {
    role: {
      description: "Role of the user",
      required: true,
      type: String
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
    name: {
      description: "Admin name",
      required: true,
      type: String
    },
    adminViewable: {
      description: "Is viewable by admin",
      required: true,
      type: Boolean
    },
    avatarUrl: {
      description: "Admin avatar url",
      required: false,
      type: String
    }

  },
};

export const AdminModel = createRowSchema<Admin>(AdminStructure);
