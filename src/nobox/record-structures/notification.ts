import { Space } from "nobox-client";
import { createRowSchema } from "../config";

export enum NotificationType {
  RIDE_REQUEST = "RIDE_REQUEST",
  RIDE_ACCEPTED = "RIDE_ACCEPTED",
  RIDE_STARTED = "RIDE_STARTED",
  RIDE_COMPLETETED_DRIVER = "RIDE_COMPLETETED_DRIVER",
  RIDE_COMPLETETED_PASSENGER = "RIDE_COMPLETETED_PASSENGER",
  RIDE_REJECTED = "RIDE_REJECTED",
  RIDE_CANCELLED_BY_DRIVER = "RIDE_CANCELLED_BY_DRIVER",
  RIDE_CANCELLED_BY_PASSENGER = "RIDE_CANCELLED_BY_PASSENGER"
}



export interface Notification {
    
    userId: string;
    type: NotificationType;
    from: string;
    to: string;
    triggeredById: string;
    seats: number;
    rideId: string;
    triggeredByAvatarUrl: string;
    triggeredByFirstName: string;
    triggeredByLastName: string;
    triggeredByUsername: string;
    // triggeredByNumber: string;
    price: number;
    isRead: boolean;
    conversationId?: string;
    driverNumber?: string
  }
  
  export const NotificationStructure: Space<Notification> = {
    space: "Notification",
    description: "A record space for user notifications",
    structure: {

      userId: {
        description: "The ID of the user receiving the notification",
        required: true,
        type: String,
      },
      type: {
        description: "Type of the notification",
        required: true,
        type: String,
      },
      from: {
        description: "Starting point of the ride or request",
        required: true,
        type: String,
      },
      to: {
        description: "Destination of the ride or request",
        required: true,
        type: String,
      },
      rideId: {
        description: "id of the ride",
        required: true,
        type: String,
      },
      triggeredById: {
        description: "ID of the user who triggered the notification",
        required: true,
        type: String,
      },
      triggeredByAvatarUrl: {
        description: "Avatar URL of the user who triggered the notification",
        required: true,
        type: String,
      },
      triggeredByFirstName: {
        description: "First name of the user who triggered the notification",
        required: true,
        type: String,
      },
     
      triggeredByLastName: {
        description: "Last name of the user who triggered the notification",
        required: true,
        type: String,
      },
      triggeredByUsername: {
        description: "Username of the user who triggered the notification",
        required: true,
        type: String,
      },
      isRead: {
        description: "Indicates if the notification has been read",
        required: true,
        type: Boolean,
      },
      seats: {
        description: "Number of seats for a ride request",
        required: true,
        type: Number,
      },
      conversationId: {
        description: "Id of the conversation if available",
        required: false,
        type: String,
      },
      driverNumber: {
        description: "Number of the driver",
        required: false,
        type: String,
      },
      price: {
        description: "Price of the ride ",
        required: true,
        type: Number
      }
      // isCompleted: {
      //   description: "Is it completed",
      //   required: true,
      //   type: Boolean,
      // },
    },
  };
  
  export const NotificationModel = createRowSchema<Notification>(
    NotificationStructure
  );
  