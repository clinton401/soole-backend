import { MessageModel } from "../nobox/record-structures/message";
import {paginationOptions, getUserPageInfo} from "../lib/utils"
import {unknown_error} from "../lib/variables"


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
export const findMany = async (conversationId: string, page?: string) => {
    try {
        const options = paginationOptions("asc")

        const messages = await MessageModel.find({ conversationId }, options);
        if(!messages){
            throw new Error(unknown_error)
        }
        const pageSize = 25;
        const currentPage = Math.max(1, Number(page) || 1);
        const data = getUserPageInfo(messages, pageSize, currentPage, 'messages');
        return data
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