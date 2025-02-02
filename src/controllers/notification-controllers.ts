import { Request, Response, NextFunction } from "express";
import { NotificationModel } from "../nobox/record-structures/notification";
import createError from "http-errors";
import { server_error, unauthorized_error } from "../lib/variables";
import {paginationOptions} from "../lib/utils"


export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return next(createError(401, unauthorized_error));
    try {
      
          
        const notifications = await NotificationModel.find({ userId }, paginationOptions());
        res.status(200).json({
            success: true,
            message: "Notifications found successfully.",
            notifications
        });
    } catch (error) {
        console.error(`Unable to get notifications: ${error}`)
        return next(createError(401, server_error))
    }
}

export const readNotifications = async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const notificationId = req.params.id;
    if (!userId) return next(createError(401, unauthorized_error));
    try{
        const params = {
            isRead: true
        };
        const isNotificationAvailable = await NotificationModel.findOne({id: notificationId}, {});
        if(!isNotificationAvailable) return next(createError(404, "Notification not found."));
        const notification = await NotificationModel.updateOneById(notificationId, params);
        res.status(200).json({
            success: true,
            message: "Notification read successfully.",
            notification
        });
    }catch (error) {
        console.error(`Unable to read notifications: ${error}`)
        return next(createError(401, server_error))
    }
}

