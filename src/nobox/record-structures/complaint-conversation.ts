import { Space } from "nobox-client";
import { createRowSchema } from "../config";
import { ComplaintSenderType } from "./complaint-message";
export enum ComplaintStatus {
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
}

export interface ComplaintConversation {
  
  userId: string;
  userName: string;
  userEmail: string;
  status: ComplaintStatus;
  complaint: string;
  starred: boolean;
  adminViewable: boolean;
  isDeleted : boolean;
}

export const ComplaintConversationStructure: Space<ComplaintConversation> = {
  space: "ComplaintConversation",
  description: "A record space for complaint conversations",
  structure: {
    userId: {
      description: "The user who submitted the complaint",
      required: true,
      type: String,
    },
    userName: {
      description: "Name of the user who submitted the complaint",
      required: true,
      type: String,
    },
    userEmail: {
      description: "Email of the user who submitted the complaint",
      required: true,
      type: String,
    },
    status: {
      description: "The current status of the complaint",
      required: true,
      type: String,
    },
    complaint: {
      description: "The complaint",
      required: true,
      type: String,
    },
   
    starred: {
        description: "Is the conversation starred",
        required: true,
        type: Boolean,
      },
      adminViewable: {
        description: "Is the conversation viewable by admin",
        required: true,
        type: Boolean,
      },
      isDeleted : {
        description: "Is the conversation moved to bin",
        required: true,
        type: Boolean,
      },
  },
};

export const ComplaintConversationModel = createRowSchema<ComplaintConversation>(
  ComplaintConversationStructure
);
