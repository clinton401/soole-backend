
import { NotificationModel, NotificationType, Notification } from "../nobox/record-structures/notification";
import { User } from "../nobox/record-structures/user";
import {unknown_error} from "../lib/variables";
import { io } from "..";
export const createNotification = async(data: Notification) => {
try{
const notification = await NotificationModel.insertOne(data);
if(!notification) {
    throw new Error(unknown_error)
}
io.emit("notification", notification);
return notification
}catch(error){
    throw error
}
}