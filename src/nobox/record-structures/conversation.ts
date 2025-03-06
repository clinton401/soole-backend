import { Space } from "nobox-client";
import { createRowSchema } from "../config";

export interface Conversation {
  participant1Id: string;
  participant2Id: string;
  lastMessage?: string;
  lastMessageDate?: string;
  participantsDetails: {
    avatarUrl: string;
    id: string;
    name: string
  }[]
  viewedBy: string[];
  deletedBy: string[]
}

export const ConversationStructure: Space<Conversation> = {
  space: "Conversation",
  description: "A Record Space for Conversations",
  structure: {

    participant1Id: {
      description: "ID of the first participant",
      required: true,
      type: String,
    },
    participant2Id: {
      description: "ID of the second participant",
      required: true,
      type: String,
    },
    lastMessage: {
      description: "Content of the last message in the conversation",
      required: false,
      type: String,
    },
    lastMessageDate: {
      description: "Timestamp of when the last message was sent",
      required: false,
      type: String,
    },
    viewedBy: {
      description: "Array of participant IDs who have viewed the last message",
      required: false,
      type: Array,
    },
    deletedBy: {
      description: "Array of participant IDs who have deleted the conversation",
      required: false,
      type: Array,
    },
    participantsDetails: {
      description: "Details for each patricipants",
      required: true,
      type: Array
    }
  },
};

export const ConversationModel = createRowSchema<Conversation>(ConversationStructure);
