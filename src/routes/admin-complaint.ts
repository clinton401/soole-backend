import {Router} from "express";
import { getComplaintSummary, getComplaintConversations, getMessagesSentByAdmin, replyToComplaint, getComplaintMessages, starComplaintConversation, markComplaintAsResolved, moveComplaintsToBin, deleteComplaints, searchForComplaints, searchForSentMessages } from "../controllers/admin-complaint-controllers";
import { checkSuperAdmin } from "../middlewares/admins";


const adminComplaint = Router();
adminComplaint.get("/summary", getComplaintSummary);
adminComplaint.get("/", getComplaintConversations);
adminComplaint.patch("/bin", moveComplaintsToBin);
adminComplaint.get("/search/sent", searchForSentMessages);
adminComplaint.delete("/bin", deleteComplaints);
adminComplaint.get("/reply", getMessagesSentByAdmin);
adminComplaint.post("/:id/reply",  replyToComplaint);
adminComplaint.get("/:id/messages",  getComplaintMessages);
adminComplaint.patch("/:id/star",  starComplaintConversation);
adminComplaint.patch("/:id/resolve",  markComplaintAsResolved);

export default adminComplaint