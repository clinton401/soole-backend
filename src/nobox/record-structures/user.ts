import { Space } from "nobox-client";
import { createRowSchema } from "../config";
export enum UserStatus {
  SUSPENDED = "SUSPENDED",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DEACTIVATED= "DEACTIVATED"
}
export interface User {
  phone: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  isNumberVerified: boolean;
  avatarUrl?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dob?: string;
  bio?: string;
  username?: string;
  dayOfCreation : string;
  weekOfCreation : string;
  // avatarPublicId?: string;
  email?: string;
  totalTrips: number;
  status: UserStatus;
  totalRides: number;
  adminViewable: boolean
  analyticsDate: string;
}

export const UserStructure: Space<User> = {
  space: "User",
  description: "A Record Space for Users",
  structure: {
    phone: {
      description: "User's Phone Number",
      required: true,
      type: String,
    },
    firstName: {
      description: "User's First Name",
      type: String,
      required: false,
    },
    lastName: {
      description: "User's Last Name",
      type: String,
      required: false,
    },
    password: {
      description: "User's Password",
      required: false,
      type: String,
      // hashed: true
    },
    isNumberVerified: {
      description: "User's Verified Status",
      required: true,
      type: Boolean,
    },
    gender: {
      description: "User's Gender",
      required: false,
      type: String,
    },
    dob: {
      description: "User's Date of Birth ",
      required: false,
      type: String,
    },
    bio: {
      description: "User's Bio ",
      required: false,
      type: String,
    },
    username: {
      description: "User's Username",
      required: false,
      type: String,
    },
    avatarUrl: {
      description: "User's Avatar URL",
      required: false,
      type: String,
    },
    // avatarPublicId: {
    //   description: "User's Avatar Publid ID",
    //   required: false,
    //   type: String,
    // },
    email: {
      description: "User's  Email Address",
      required: false,
      type: String,
    },
    totalTrips: {
      description: "Total amount of trips a user has",
      required: true,
      type: Number,
    },
    totalRides: {
      description: "Total amount of rides a user created",
      required: true,
      type: Number,
    },
   
    status: {
      description: "Status of the user",
      required: true,
      type: String,
    },
    analyticsDate : {
      description: "Analytics date for the user ",
      required: true,
      type: String,
    },
    weekOfCreation: {
      description: "Week number of the year when the user was created",
      required: true,
      type: String,
    },
    dayOfCreation : {
      description: " day of the week when the user was created (in lowercase).",
      required: true,
      type: String,
    },
    adminViewable : {
      description: " Is viewable by admin",
      required: true,
      type: Boolean,
    },


  },
};

export const UserModel = createRowSchema<User>(UserStructure);
