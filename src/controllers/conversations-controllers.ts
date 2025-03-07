import { Request, Response, NextFunction } from "express";
import { server_error, unknown_error, unauthorized_error } from "../lib/variables";
import createError from "http-errors";
import { ConversationModel } from "../nobox/record-structures/conversation";
import { io } from "..";
import { getUserTotalConversations, insertNewConversation, findUnique as findUniqueConvo, conversationExists } from "../data/conversation";
import { insertNewMessage, findMany as findManyMessages, findUnique as findUniqueMessage, updateOneById as updateMesageById } from "../data/message";



export const getUserConversations = async (req: Request, res: Response, next: NextFunction) => {
    const {page} = req.query as {
        page?: string
    }
    const userId = req.userId;

    if (!userId) return next(createError(401, unauthorized_error));
    try {
        const data = await getUserTotalConversations(userId, page);
        res.status(200).json({
            status: "success",
            message: "Conversations found successfully",
            data
        });

    } catch (error) {
        console.error(`Unable to get users conversation: ${error}`);
        return next(createError(500, server_error))
    }
}
export const createConversation = async (req: Request, res: Response, next: NextFunction) => {
    const participant1Id = req.userId;
    const { participant2Id } = req.body
    if (!participant1Id) return next(createError(401, unauthorized_error));
    if (!participant2Id) return next(createError(400, "Participant 2 ID is required."));
    try {
        // const conversation = await findUniqueConvo({ participant1Id, participant2Id });
        const convoExists = await conversationExists(participant1Id, participant2Id);
        if (convoExists) {
            return next(createError(400, "A conversation between these users already exists."))
        }
        const conversation = await insertNewConversation(participant1Id, participant2Id);

        if (!conversation) return next(createError(500, unknown_error));
        if (typeof conversation === "string") {
            return next(createError(400, conversation))
        }
        res.status(201).json({
            status: "success",
            message: "Conversation created successfully",
            conversation
        })
    } catch (error) {
        console.error(`Unable to get create conversation: ${error}`);
        return next(createError(500, server_error))
    }
}

export const createMessage = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const conversationId = req.params.id
    const { content, receiverId } = req.body
    if (!userId) return next(createError(401, unauthorized_error));
    if (!receiverId || !content || content.length < 1) return next(createError(400, "All fields are required. The 'content' field must contain at least one character."))
    try {
if(userId === receiverId){
    return next(createError(400, "You cannot send a message to yourself."))
}
        const conversationExists = await findUniqueConvo(conversationId, userId);
        if (!conversationExists) return next(createError(404, "Conversation not found or has been deleted."));

        if (conversationExists.participant1Id !== userId && conversationExists.participant2Id !== userId) return next(createError(403, "You can't send a message because you are not a member of this conversation."))
        const message = await insertNewMessage(conversationId, userId, receiverId, content);
        if (!message) return next(createError(500, unknown_error));
        const now = new Date().toISOString();
        const viewedBy = [userId]

        const updatedConversation = await ConversationModel.updateOneById(conversationId, { lastMessage: content, lastMessageDate: now, 
            viewedBy, lastMessageSenderId: userId });
        if (!updatedConversation) return next(createError(500, unknown_error));
        io.emit("message", message);
        res.status(201).json({
            status: "success",
            message: "message sent successfully",
            data: message
        })
    } catch (error) {
        console.error(`Unable to get create message: ${error}`);
        return next(createError(500, server_error))
    }
}
export const getConversationMessages = async (req: Request, res: Response, next: NextFunction) => {
    const {page} = req.query as {
        page?: string
    }
    const conversationId = req.params.id
    try {
        const data = await findManyMessages(conversationId, page);
        res.status(200).json({
            status: "success",
            message: "Messages found successfully",
            data
        })
    } catch (error) {
        console.error(`Unable to get conversation messages: ${error}`);
        return next(createError(500, server_error))
    }
}
export const markMessageAsRead = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const userId = req.userId;
    if (!userId) return next(createError(401, unauthorized_error));
    try {
        const message = await findUniqueMessage(id);
        if (!message) return next(createError(404, "Message not found."));
        if (message.receiverId !== userId) return next(createError(403, "You are not authorized to mark this message as read. Only the receiver can perform this action."));
        if (message.isRead === true) {
            res.status(200).json({
                status: "success",
                message: "Message already marked as read.",
                data: message
            })
            return;
        }
        const updatedMessage = await updateMesageById(id);
        if (!updatedMessage) return next(createError(500, unknown_error))
        res.status(200).json({
            status: "success",
            message: "Message marked as read successfully",
            data: updatedMessage
        })

    } catch (error) {
        console.error(`Unable to get mark message as read: ${error}`);
        return next(createError(500, server_error))

    }
}

export const deleteConversation = async (req: Request, res: Response, next: NextFunction) => {
    const conversationId = req.params.id;
    const userId = req.userId;

    if (!userId) return next(createError(401, unauthorized_error));

    try {
        const conversation = await findUniqueConvo(conversationId, userId);

        if (!conversation) {
            return next(createError(404, "Conversation not found."));
        }

        const { participant1Id, participant2Id, deletedBy } = conversation;

        if (![participant1Id, participant2Id].includes(userId)) {
            return next(createError(403, "You do not have permission to delete this conversation."));
        }

        if (deletedBy.includes(userId)) {
            return next(createError(400, "This conversation has already been deleted by you."));
        }
        if (deletedBy.length < 2) {

            const updatedConversation = await ConversationModel.updateOneById(conversationId, {
                deletedBy: [...deletedBy, userId],

            });

            if (!updatedConversation) {
                return next(createError(500, unknown_error));
            }
        } else {
            const deletedConversation = await ConversationModel.deleteOneById(conversationId);
            if (!deletedConversation) {
                return next(createError(500, unknown_error));
            }
        }


        res.status(200).json({
            status: "success",
            message: "Conversation deleted successfully.",
        });
    } catch (error) {
        console.error(`Error while deleting conversation: ${error}`);
        next(createError(500, server_error));
    }
};

export const markConversationAsRead = async (req: Request, res: Response, next: NextFunction) => {
    const conversationId = req.params.id;
    const userId = req.userId;

    if (!userId) return next(createError(401, unauthorized_error));
    try {
        const conversation = await findUniqueConvo(conversationId, userId);
        if (!conversation) {
            return next(createError(404, "Conversation not found."));
        }

        const { participant1Id, participant2Id, viewedBy } = conversation;

        if (![participant1Id, participant2Id].includes(userId)) {
            return next(createError(403, "You do not have permission to mark this conversation as read."));
        }
        if (viewedBy.includes(userId)) {
            return next(createError(400, "This conversation has already been viewed by you."));
        }

        const updatedConversation = await ConversationModel.updateOneById(conversationId, {
            viewedBy: [...viewedBy, userId],
        });

        if (!updatedConversation) {
            return next(createError(500, unknown_error));
        }

        res.status(200).json({
            status: "success",
            message: "Conversation marked as read successfully.",
        });
    } catch (error) {
        console.error(`Error while marking conversation as read: ${error}`);
        next(createError(500, server_error));
    }
}