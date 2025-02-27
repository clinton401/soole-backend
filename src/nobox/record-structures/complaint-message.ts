import { Space } from "nobox-client";
import { createRowSchema } from "../config";

export enum ComplaintSenderType  {
    USER = "USER",
    ADMIN = "ADMIN"
}

export interface ComplaintMessage {
  conversationId: string;
  senderId: string;
  message: string;
  senderType: ComplaintSenderType;
  userAvatarUrl?: string;
}

export const ComplaintMessageStructure: Space<ComplaintMessage> = {
  space: "ComplaintMessage",
  description: "A record space for complaint messages",
  structure: {
    conversationId: {
      description: "The ID of the complaint conversation",
      required: true,
      type: String,
    },
    senderId: {
      description: "The ID of the sender",
      required: true,
      type: String,
    },
    message: {
      description: "The content of the message",
      required: true,
      type: String,
    },
    userAvatarUrl: {
      description: "The avatar url of the user",
      required: false,
      type: String,
    },
 
    senderType: {
        description: "The type of sender (USER or ADMIN)",
        required: true,
        type: String,
      },
   
  },
};

export const ComplaintMessageModel = createRowSchema<ComplaintMessage>(
  ComplaintMessageStructure
);
