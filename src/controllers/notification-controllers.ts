import { Request, Response, NextFunction } from "express";
import { NotificationModel } from "../nobox/record-structures/notification";
import createError from "http-errors";
import { server_error, unauthorized_error, unknown_error } from "../lib/variables";
import {paginationOptions, getUserPageInfo} from "../lib/utils"


export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    const {page} = req.query as  {
page?: string
    }
    const userId = req.userId;
    if (!userId) return next(createError(401, unauthorized_error));
    const currentPage = Math.max(1, Number(page) || 1);
    try {
      
          const options = paginationOptions()
        const notifications = await NotificationModel.find({ userId }, options);
        if(!notifications) {
            return next(createError(500, unknown_error))
        }
        const pageSize = 15;
        const data = getUserPageInfo(notifications, pageSize, currentPage, "notifications");
        res.status(200).json({
            success: true,
            message: "Notifications found successfully.",

            data
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

