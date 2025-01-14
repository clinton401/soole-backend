import {Router} from "express";
import { getNotifications, readNotifications } from "../controllers/notification-controllers";

const notification = Router();

notification.get("/", getNotifications);
notification.put("/:id/read", readNotifications);

export default notification