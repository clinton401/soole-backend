import { Request, Response, NextFunction } from "express";
import { ComplaintConversationModel, ComplaintConversation, ComplaintStatus } from "../nobox/record-structures/complaint-conversation";
import { ComplaintMessageModel, ComplaintSenderType } from "../nobox/record-structures/complaint-message";
import { server_error, unauthorized_error, unknown_error } from "../lib/variables";
import createError from "http-errors";
import { getPageInfo, adminPaginationOptions } from "../lib/utils"
import { adminReplyEmailTemplate } from "../lib/html-templates";
import { sendEmail } from "../data/mail";

// export getNotificationCount = async(req: Request, res: Response, next: NextFunction)
export const getComplaintSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const [total, sentCount] = await Promise.all([
            ComplaintConversationModel.find({}),
            ComplaintMessageModel.find({ senderType: ComplaintSenderType.ADMIN })

        ]);
        if (!total || !sentCount) {
            return next(createError(500, unknown_error));
        }
         const in_progress = ComplaintStatus.IN_PROGRESS;
        const validTotal = total.filter(complaint => {
            return !complaint.isDeleted;
        })
        const total_count = validTotal.filter((complaint) => complaint.status === in_progress).length;
        const sent_count = sentCount.length;
        const starred_count = validTotal.filter((complaint) => complaint.starred).length;
        const bin_count = total.filter((complaint) => complaint.isDeleted).length;
        const data = {
            total_count,
            sent_count,
            starred_count,
            bin_count
        }
        res.json({
            status: "success",
            message: "Summary fetched successfully",
            data
        })

    } catch (error) {
        console.error(`Unable to get complaint summary: ${error}`);
        return next(createError(500, server_error))
    }

}

export const getComplaintConversations = async (req: Request, res: Response, next: NextFunction) => {
    const { filter, page } = req.query as {
        filter: string,
        page?: string
    };

    const validFilters = ['total', 'starred', 'bin'];
    const selectedFilter = validFilters.includes(filter?.toLowerCase()) ? filter.toLowerCase() : "total";

    type Status = "TOTAL" | "STARRED" | "BIN"

    const filterVariable = selectedFilter.toUpperCase() as Status;
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = 15;
    const options = adminPaginationOptions(currentPage, pageSize);
    try {
        let conversations: ComplaintConversation[] = []

        if (filterVariable === "STARRED") {
            const starred = await ComplaintConversationModel.find({ starred: true }, options);
            conversations = starred.filter(convo => convo.isDeleted === false)

        } else if (filterVariable === "BIN") {
            conversations = await ComplaintConversationModel.find({ isDeleted: true }, options);
        } else {
            const total = await ComplaintConversationModel.find({ }, options);

            conversations = total.filter(convo => convo.isDeleted === false)
        }

        if (!conversations) {
            return next(createError(500, unknown_error))
        }
        const { totalLength: totalConversations, totalPages, nextPage, filteredData, prevPage } = getPageInfo(conversations, pageSize, currentPage)
        res.json({
            status: "success",
            message: "Complaint conversations found successfully",
            data: {
                totalConversations, totalPages, nextPage, conversations: filteredData, prevPage
            }
        })

    } catch (error) {
        console.error(`Unable to get total complaint conversations ${error}`);
        return next(createError(500, server_error))
    }
}


export const getMessagesSentByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { page } = req.query as {
        page?: string
    };
    try {
        const currentPage = Math.max(1, Number(page) || 1);
        const pageSize = 15;
        const options = adminPaginationOptions(currentPage, pageSize);
        const messages = await ComplaintMessageModel.find({ senderType: ComplaintSenderType.ADMIN }, options);
        if (!messages) {
            return next(createError(500, unknown_error));
        }
        const { totalLength: totalMessages, totalPages, nextPage, filteredData } = getPageInfo(messages, pageSize, currentPage)
        res.json({
            status: "success",
            message: "Messages sent by admin found successfully",
            data: {
                totalMessages, totalPages, nextPage, messages: filteredData
            }
        })
    } catch (error) {
        console.error(`Unable to get messages sent by admin: ${error}`);
        return next(createError(500, server_error));
    }
}


export const replyToComplaint = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { message } = req.body
    const userId = req.userId;
    if (!userId) {
        return next(createError(401, unauthorized_error))
    }
    if (!message || message.length < 2) {
        return next(createError(400, "Message is required and must be at least 2 characters long"));
    }
    try {

        const conversation = await ComplaintConversationModel.findOne({ id });
        if (!conversation) {
            return next(createError(404, "Conversation not found."))
        }
        if(conversation.isDeleted){
            return next(createError(400, "You cannot reply to a complaint that is in the bin."));
        }
        const data = {
            conversationId: id,
            message,
            senderId: userId,
            senderType: ComplaintSenderType.ADMIN
        }
        const reply = await ComplaintMessageModel.insertOne(data);

        if (!reply) {
            return next(createError(500, unknown_error));
        }



        const { subject, text, template } = adminReplyEmailTemplate(conversation.userName, conversation.complaint, message);
        await sendEmail(conversation.userEmail, subject, text, template);
        res.json({
            status: "success",
            message: "Reply sent successfully",
            reply
        })
    } catch (error) {
        console.error(`Unable to reply to complaint: ${error}`);
        return next(createError(500, server_error));
    }
}

export const getComplaintMessages = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { page } = req.query as {
        page?: string
    };
    try {
        const conversation = await ComplaintConversationModel.findOne({ id });
        if (!conversation) {
            return next(createError(404, "Conversation not found."))
        };
        const currentPage = Math.max(1, Number(page) || 1);
        const pageSize = 100;
        const options = adminPaginationOptions(currentPage, pageSize, "asc");
        const messages = await ComplaintMessageModel.find({ conversationId: id }, options);
        if (!messages) {
            return next(createError(500, unknown_error));
        }

        const { totalLength: totalMessages, totalPages, filteredData } = getPageInfo(messages, pageSize, currentPage)
        res.json({
            status: "success",
            message: "Messages  found successfully",
            data: {
                totalMessages, totalPages, nextPage: null, messages: filteredData, conversation
            }
        })
    }
    catch (error) {
        console.error(`Unable to get complaint messages: ${error}`);
        return next(createError(500, server_error));
    }
}

export const starComplaintConversation = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { starred } = req.body;

    if (typeof starred !== "boolean") {
        return next(createError(400, "Invalid starred value. Must be true or false."));
    }
    try {
        const conversation = await ComplaintConversationModel.findOne({ id });
        if (!conversation) {
            return next(createError(404, "Conversation not found."))
        };
 if(conversation.isDeleted){
            return next(createError(400, "You cannot star conversation that is in the bin."));
        }
        if (conversation.starred === starred) {
            return next(createError(400, `Conversation has already been ${starred ? "starred" : "unstarred"}`))
        }

        const updatedConversation = await ComplaintConversationModel.updateOneById(id, { starred });
        if (!updatedConversation) {
            return next(createError(500, unknown_error));
        }
        res.json({
            status: "success",
            message: `Complaint ${starred ? "starred" : "unstarred"} successfully.`,
            conversation: updatedConversation
        })
    } catch (error) {
        console.error(`Unable to star complaint conversation: ${error}`);
        return next(createError(500, server_error));
    }
}


export const markComplaintAsResolved = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const conversation = await ComplaintConversationModel.findOne({ id });
        if (!conversation) {
            return next(createError(404, "Conversation not found."))
        };
 if(conversation.isDeleted){
            return next(createError(400, "You cannot mark a complaint as resolved that is in the bin."));
        }
        if (conversation.status === ComplaintStatus.RESOLVED) {
            return next(createError(400, "Complaint has already been marked as completed."))
        };


        const updatedConversation = await ComplaintConversationModel.updateOneById(id, { status: ComplaintStatus.RESOLVED });
        if (!updatedConversation) {
            return next(createError(500, unknown_error));
        }
        res.json({
            status: "success",
            message: "Complaint marked as resolved successfully.",
            conversation: updatedConversation
        })
    } catch (error) {
        console.error(`Unable to mark complaint as resolved`);
        return next(createError(500, server_error))
    }
}


export const moveComplaintsToBin = async (req: Request, res: Response, next: NextFunction) => {
    const { complaintIds } = req.body;
    if (!Array.isArray(complaintIds) || complaintIds.length < 1 || !complaintIds.every(id => typeof id === "string")) {
        return next(createError(400, "Invalid complaint IDs. Must be an non empty array of complaint IDs"));
    };
    try {
        const complaints: ComplaintConversation[] = []
        for (const id of complaintIds) {
            try {
                const complaint = await ComplaintConversationModel.findOne({ id });
                if (!complaint || complaint.isDeleted === true) continue
                const updatedComplaint = await ComplaintConversationModel.updateOneById(id, { isDeleted: true });
                if (!updatedComplaint) {
                    continue;
                }
                complaints.push(updatedComplaint)
            } catch (error) {
                console.error(`Unable to move complaint of ${id} to bin: ${error}`)
            }
        }
        if (complaints.length < 1) {
            return next(createError(500, "Failed to move complaints to the bin. Please try again."))
        }
        if (complaints.length < complaintIds.length) {
            res.json({
                status: "success",
                message: "Some complaints were successfully moved to the bin, but some could not be processed."
            });
            return;
        }
        res.json({
            status: "success",
            message: "Complaints moved to bin successfully."
        })
    } catch (error) {
        console.error(`Unable to move complaints to bin: ${error}`);
        return next(createError(500, server_error));
    }
}
export const deleteComplaints = async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.query as {
        ids?: string
    }
    const complaintIds = ids ? ids.split(",") : [];
    if (!Array.isArray(complaintIds) || complaintIds.length < 1 || !complaintIds.every(id => typeof id === "string")) {
        return next(createError(400, "Invalid complaint IDs. Must be an non empty array of complaint IDs"));
    };
    try {
        const complaints: ComplaintConversation[] = []
        for (const id of complaintIds) {
            try {
                const complaint = await ComplaintConversationModel.findOne({ id });
                if (!complaint || !complaint.isDeleted === true) continue
                const updatedComplaint = await ComplaintConversationModel.deleteOneById(id);
                if (!updatedComplaint) {
                    continue;
                }
                complaints.push(updatedComplaint)
            } catch (error) {
                console.error(`Unable to delete complaint of ${id} : ${error}`)
            }
        }
        if (complaints.length < 1) {
            return next(createError(500, "Failed to delete complaints . Please try again."))
        }
        if (complaints.length < complaintIds.length) {
            res.json({
                status: "success",
                message: "Some complaints were successfully deleted, but some could not be processed."
            });
            return;
        }
        res.json({
            status: "success",
            message: "Complaints deleted successfully."
        })
    } catch (error) {
        console.error(`Unable to delete complaints : ${error}`);
        return next(createError(500, server_error));
    }
}


export const searchForComplaints = async (req: Request, res: Response, next: NextFunction) => {
    const { query, page } = req.query as {
        query?: string;
        page?: string,
    };
    if (!query || query.length < 1) {
        return next(createError(400, "Search query is required and must be at least 1 character long."))
    }


    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = 15;
    const options = adminPaginationOptions(currentPage, pageSize);

    try {
        const complaints = await ComplaintConversationModel.find({ }, options);
        if (!complaints) {
            return next(createError(500, unknown_error))
        }

        // console.log({filterVariable, complaints})    
        const validComplaints = complaints.filter(convo => {

            const { complaint } = convo

            const matchesQuery = [complaint]
                .some(field => field.toLowerCase().includes(query.toLowerCase()));
            return matchesQuery;
        });

        res.json({
            status: "success",
            message: "Complaints found successfully",
            data: {
                conversations: validComplaints.slice(0, pageSize)
            }
        })


    } catch (error) {
        console.error(`Unable to search for complaints by admin: ${error}`);
        return next(createError(500, server_error))
    }
}
export const searchForSentMessages = async (req: Request, res: Response, next: NextFunction) => {
    const { query, page } = req.query as {
        query?: string;
        page?: string,
    };
    if (!query || query.length < 1) {
        return next(createError(400, "Search query is required and must be at least 1 character long."))
    }


    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = 15;
    const options = adminPaginationOptions(currentPage, pageSize);

    try {
        const messages = await ComplaintMessageModel.find({ senderType: ComplaintSenderType.ADMIN }, options);
        if (!messages) {
            return next(createError(500, unknown_error))
        }

        // console.log({filterVariable, complaints})    
        const validMessages = messages.filter(convo => {

            const { message } = convo

            const matchesQuery = [message]
                .some(field => field.toLowerCase().includes(query.toLowerCase()));
            return matchesQuery;
        });

        res.json({
            status: "success",
            message: "Complaints found successfully",
            data: {
                messages: validMessages.slice(0, pageSize)
            }
        })


    } catch (error) {
        console.error(`Unable to search for complaints by admin: ${error}`);
        return next(createError(500, server_error))
    }
}