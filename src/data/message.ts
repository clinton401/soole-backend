import { MessageModel } from "../nobox/record-structures/message";
import {paginationOptions} from "../lib/utils"


export const insertNewMessage = async (conversationId: string, senderId: string, receiverId: string, content: string) => {
    try {
        const newConversation = await MessageModel.insertOne({
            conversationId,
            senderId,
            receiverId,
            content,
            isRead: false
        })
        return newConversation

    } catch (error) {
        throw error
    }
}
export const findUnique = async (id: string) => {
    try {
        const message = await MessageModel.findOne({ id }, {});
        return message;
    } catch (error) {
        throw error
    }
}
export const findMany = async (conversationId: string) => {
    try {
        const options = paginationOptions("asc")

        const messages = await MessageModel.find({ conversationId }, options);
        return messages;
    } catch (error) {
        throw error
    }
}
export const updateOneById = async (id: string) => {
    try {
        const updatedMessage = await MessageModel.updateOneById(id, {
            isRead: true

        })
        return updatedMessage
    } catch (error) {
        throw error
    }
}