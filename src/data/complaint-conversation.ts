import { ComplaintMessageModel, ComplaintSenderType } from "../nobox/record-structures/complaint-message";
import { ComplaintConversationModel, ComplaintStatus } from "../nobox/record-structures/complaint-conversation";
import { User } from "../nobox/record-structures/user"

type TotalUser = User & {
    id: string
}

export const createComplaintConversation = async (user: TotalUser, message: string) => {
    try {
        const userName = user.firstName + " " + user.lastName;
        const convoData = {
            userId: user.id,
            userName,
            userEmail: user.email as string,
            status: ComplaintStatus.IN_PROGRESS,
            complaint:message,
            starred: false,
            adminViewable: true,
            isDeleted: false,

        }
        const complaintConversation = await ComplaintConversationModel.insertOne(convoData);
        if (!complaintConversation) {
            throw new Error("Unable to create complaint conversation")
        }
        const messageData = {
            conversationId: complaintConversation.id,
            userAvatarUrl: user.avatarUrl as string,
            senderId: user.id,
            message,
            senderType: ComplaintSenderType.USER
        }
        const complaintMessage = await ComplaintMessageModel.insertOne(messageData);
        if(!complaintMessage){
            throw new Error("Unable to intiate complaint conversation with a message")
        }

        return {complaintMessage, complaintConversation}
    } catch (error) {
        throw error
    }
}
