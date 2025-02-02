import {paginationOptions} from "../lib/utils"
import { ConversationModel } from "../nobox/record-structures/conversation";

export const getUserTotalConversations = async (userId: string) => {
    
    try {
        const options = paginationOptions()
        const convo1 = await ConversationModel.find({ participant1Id: userId }, options);
        const convo2 = await ConversationModel.find({ participant2Id: userId }, options);
        const totalConvo = [...convo1, ...convo2];
        const notDeletedConvo = totalConvo.filter(convo => {
            return !convo.deletedBy.includes(userId)
        }).sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return options.sort.order === "asc" ? dateA - dateB : dateB - dateA;
        });


        const start = (options.pagination.page - 1) * options.pagination.limit;
        const end = start + options.pagination.limit;
        const paginatedConvo = notDeletedConvo.slice(start, end);

        return paginatedConvo;
    } catch (error) {
        throw error
    }
}

export const insertNewConversation = async (participant1Id: string, participant2Id: string) => {
    try {
        const newConversation = await ConversationModel.insertOne({
            participant1Id,
            participant2Id,
            lastMessage: undefined,
            lastMessageDate: undefined,
            viewedBy: [],
            deletedBy: [],
        })
        return newConversation

    } catch (error) {
        throw error
    }
}
export const findUnique = async (id: string) => {
    try {
        const conversation = await ConversationModel.findOne({ id }, {});
        return conversation;
    } catch (error) {
        throw error
    }
}

