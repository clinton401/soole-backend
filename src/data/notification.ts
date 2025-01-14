
import { NotificationModel, NotificationType } from "../nobox/record-structures/notification";
import { User } from "../nobox/record-structures/user";

type InsertOneParams = {
    userId: string;
    type: NotificationType;
    from: string;
    to : string;
    triggeredById: string;
    seats: number;
    isRead: boolean;
    user: User;
}
export const insertOne = () => {

}