import {Router} from "express";
import { getAdminRequests, acceptAdminRequest, rejectAdminRequest } from "../controllers/admin-request-controllers";

const adminRequest = Router();

adminRequest.get("/", getAdminRequests);
adminRequest.put("/:id/accept", acceptAdminRequest);
adminRequest.put("/:id/reject", rejectAdminRequest);

export default adminRequest;