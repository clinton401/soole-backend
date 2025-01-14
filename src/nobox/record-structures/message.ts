import { Space } from "nobox-client";
import { createRowSchema } from "../config";


export interface Message {
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    isRead: boolean;
  }
  
  export const MessageStructure: Space<Message> = {
    space: "Message",
    description: "A Record Space for Messages",
    structure: {
      
      conversationId: {
        description: "ID of the Conversation this Message belongs to",
        required: true,
        type: String,
      },
      senderId: {
        description: "ID of the User who sent the Message",
        required: true,
        type: String,
      },
      receiverId: {
        description: "ID of the User who receives the Message",
        required: true,
        type: String,
      },
      content: {
        description: "Content of the Message",
        required: true,
        type: String,
      },
   
      isRead: {
        description: "Whether the message has been read by the receiver",
        required: true,
        type: Boolean,
      },
    },
  };
  
  export const MessageModel = createRowSchema<Message>(MessageStructure);
  