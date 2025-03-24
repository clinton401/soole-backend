import { Router } from "express";
import { getUserConversations, createConversation, createMessage, getConversationMessages, markMessageAsRead, deleteConversation, markConversationAsRead, searchForConversations } from "../controllers/conversations-controllers";

const conversation = Router();

conversation.get("/", getUserConversations);
conversation.post("/create", createConversation);
conversation.get("/search", searchForConversations);
conversation.post("/:id/messages/create", createMessage);
conversation.get("/:id/messages", getConversationMessages);
conversation.post("/:convoId/messages/:id/read", markMessageAsRead);
conversation.delete("/:id/delete", deleteConversation);
conversation.post("/:id/read", markConversationAsRead);




export default conversation;
