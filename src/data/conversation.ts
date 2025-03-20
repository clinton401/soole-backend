import { paginationOptions } from "../lib/utils"
import { ConversationModel, Conversation, ParticipantRole } from "../nobox/record-structures/conversation";
import { NotificationModel } from "../nobox/record-structures/notification";
import { UserModel } from "../nobox/record-structures/user";
import {unknown_error} from "../lib/variables";
import { io } from "..";

export const getUserTotalConversations = async (userId: string, page?: string) => {

    try {
        const currentPage = Math.max(1, Number(page) || 1);
        const options = paginationOptions("desc")
        const convo1 = await ConversationModel.find({ participant1Id: userId }, options);
        const convo2 = await ConversationModel.find({ participant2Id: userId }, options);
        if(!convo1 || !convo2){
            throw new Error(unknown_error)
        }
        const totalConvo = [...convo1, ...convo2];
        const notDeletedConvo = totalConvo.filter(convo => {
            return !convo.deletedBy.includes(userId)
        }).sort((a, b) => {
            const dateA = new Date(a.updatedAt).getTime();
            const dateB = new Date(b.updatedAt).getTime();
            return options.sort.order === "asc" ? dateA - dateB : dateB - dateA;
        });

        const pageSize = 50;
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const paginatedConvo = notDeletedConvo.slice(start, end);
        const totalLength = notDeletedConvo.length;
        const totalPages = Math.ceil(totalLength / pageSize);
        const nextPage = currentPage < totalPages ? currentPage + 1 : null;
        const prevPage = currentPage > 1 ? currentPage - 1 : null;


        return {
            conversations: paginatedConvo, currentPage,
            totalLength,
            totalPages,
            nextPage,
            prevPage
        };
    } catch (error) {
        throw error
    }
}

export const insertNewConversation = async (participant1Id: string, participant2Id: string): Promise<any>  => {
    try {
        const [participant1, participant2, convo1, convo2] = await Promise.all([
            UserModel.findOne({ id: participant1Id }),
            UserModel.findOne({ id: participant2Id }),
            ConversationModel.findOne({ participant1Id, participant2Id }),
            ConversationModel.findOne({ participant1Id: participant2Id, participant2Id: participant1Id}),
           
        ]);
        let updatedConversation: Conversation | null;
        if (convo1) {
            const isConvo1Deleted = convo1.deletedBy.includes(participant1Id);
            const newDeletedArray = convo1.deletedBy.filter(id => {
                return id !== participant1Id
            })
            if(isConvo1Deleted) {
                updatedConversation = await ConversationModel.updateOneById(convo1.id, {
                    deletedBy: newDeletedArray
                });
                if(!updatedConversation){
                    return unknown_error
                }
                return updatedConversation
            }
          return convo1
            
        }

        if (convo2) {
            const isConvo2Deleted = convo2.deletedBy.includes(participant1Id);
            const newDeletedArray = convo2.deletedBy.filter(id => {
                return id !== participant1Id
            })
            if(isConvo2Deleted) {
                updatedConversation = await ConversationModel.updateOneById(convo2.id, {
                    deletedBy: newDeletedArray
                });
                if(!updatedConversation){
                    return unknown_error
                }
                return updatedConversation
            }
            return convo2;
        }


        if (!participant1 || !participant2) {
            return "One or more participants do not exist. Please check the provided IDs.";
        }

        if (!participant1.avatarUrl || !participant2.avatarUrl) {
            return "Both participants must have a profile picture.";
        }

        const participantsDetails = [
            {
                id: participant1.id,
                name: `${participant1.firstName} ${participant1.lastName}`,
                avatarUrl: participant1.avatarUrl,
                role: ParticipantRole.PASSENGER,
                phone: participant1.phone
            },

            {
                id: participant2.id,
                name: `${participant2.firstName} ${participant2.lastName}`,
                avatarUrl: participant2.avatarUrl,
                role: ParticipantRole.DRIVER,
                phone: participant2.phone
            }
        ];

        const newConversation = await ConversationModel.insertOne({
            participant1Id,
            participant2Id,
            viewedBy: [],
            deletedBy: [],
            participantsDetails
        });
    
        
        io.emit("conversation", newConversation)
        return newConversation;
    } catch (error) {
        return "An unexpected error occurred while creating the conversation.";
    }
};

export const findUnique = async (id: string, userId: string) => {
    try {
        const conversation = await ConversationModel.findOne({ id }, {});
        const isConvoDeleted = conversation.deletedBy.includes(userId)
        return isConvoDeleted ? null : conversation;
    } catch (error) {
        throw error
    }
}


export const conversationExists = async (id1: string, id2: string) => {
    try {
        const [convo1, convo2] = await Promise.all([
            ConversationModel.findOne({ participant1Id: id1, participant2Id: id2 }),
            ConversationModel.findOne({ participant1Id: id2, participant2Id: id1 })
        ]);

        if (convo1) {
            const isConvo1Deleted = convo1.deletedBy.includes(id1) || convo1.deletedBy.includes(id2);
            return !isConvo1Deleted;
        }

        if (convo2) {
            const isConvo2Deleted = convo2.deletedBy.includes(id1) || convo2.deletedBy.includes(id2);
            return !isConvo2Deleted;
        }

        return false;

    } catch (error) {
        throw error
    }
};
