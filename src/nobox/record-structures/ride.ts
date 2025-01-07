import { Space, ReturnObject } from "nobox-client";
import { createRowSchema } from "../config";

interface Ride {
  userId: string;
  from: string;
  to: string;
  date?: string;
  estimatedTime?: string;
  carImages?: string[];
  vehicleModel?: string;
  color?: string;
  plateNumber?: string;
  numberOfSeats?: string;
  pricePerSeat?: string;
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
      type: String,
      required: false,
    },
    pricePerSeat: {
      description: "Price Per Seat",
      type: String,
      required: false,
    },
  },
};

export const rideModel = createRowSchema<Ride>(RideStructure);
export type RideObject = ReturnObject<Ride>;
