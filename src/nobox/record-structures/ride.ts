import { Space, ReturnObject } from "nobox-client";
import { createRowSchema } from "../config";

export interface Ride {
  userId: string;
  from: string;
  to: string;
  status: "ACTIVE"| "ONGOING" | "CANCELLED" | "COMPLETED";
  date?: string;
  passengers: {
    seats: number;
    id: string;
    completed: boolean;
  }[];
  userAvatarUrl?: string;
  userFirstName?: string;
  userLastName?: string;
  userUsername?: string;
  estimatedTime?: string;
  carImages?: string[];
  vehicleModel?: string;
  color?: string;
  plateNumber?: string;
  numberOfSeats: number;
  pricePerSeat: number;
  adminViewable: boolean;
}

export const RideStructure: Space<Ride> = {
  space: "Ride",
  description: "A Record Space for Ride",
  structure: {
    userId: {
      description: "User ID",
      type: String,
      required: true,
    },
    from: {
      description: "From Location",
      type: String,
      required: true,
    },
    to: {
      description: "To Location",
      type: String,
      required: true,
    },
    status: {
      description: "Status of the ride",
      type: String,
      required: true,
    },
    date: {
      description: "Date",
      type: String,
      required: false,
    },
    estimatedTime: {
      description: "Estimated Time",
      type: String,
      required: false,
    },
    carImages: {
      description: "Images Of the Vehicle",
      type: Array,
      required: false,
    },
    passengers: {
      description: "Id of the passengers",
      type: Array,
      required: true,
    },
    vehicleModel: {
      description: "Vehicle Model",
      type: String,
      required: false,
    },
    color: {
      description: "Vehicle Color",
      type: String,
      required: false,
    },
    plateNumber: {
      description: "Vehicle Plate Number",
      type: String,
      required: false,
    },
    numberOfSeats: {
      description: "Number of Seats",
      type: Number,
      required: true,
    },
    pricePerSeat: {
      description: "Price Per Seat",
      type: Number,
      required: true,
    },
    // Missing properties added below
    userAvatarUrl: {
      description: "Avatar URL of the user",
      type: String,
      required: false,
    },
    userFirstName: {
      description: "First Name of the user",
      type: String,
      required: false,
    },
    userLastName: {
      description: "Last Name of the user",
      type: String,
      required: false,
    },
    userUsername: {
      description: "Username of the user",
      type: String,
      required: false,
    },
    adminViewable : {
      description: "Should admin be able to view this data",
      type: String,
      required: true,
      defaultValue: true
    },
  },
};


export const rideModel = createRowSchema<Ride>(RideStructure);
export type RideObject = ReturnObject<Ride>;
