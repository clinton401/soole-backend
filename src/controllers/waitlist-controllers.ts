import { Request, Response, NextFunction } from "express";
import { WaitlistModel } from "../nobox/record-structures/waitlist";
import createError from "http-errors";
import { server_error, unknown_error } from "../lib/variables";
import { JoinWailtlistSchema } from "../schemas";
import { welcomeEmailTemplate } from "../lib/html-templates";
import { sendEmail } from "../data/mail";



export const joinWaitlist = async (req: Request, res: Response, next: NextFunction) => {
    const values = req.body
    try {
        const validatedFields = JoinWailtlistSchema.safeParse(values);
        if (!validatedFields.success) {
            return next(createError(400, "Please provide a valid email address to join the waitlist."));
        }
        const { email } = validatedFields.data;

        const hasJoinedBefore = await WaitlistModel.findOne({ email: email.toLowerCase() });
        if (hasJoinedBefore) {
            return next(createError(400, "You have already joined the waitlist. Stay tuned for updates!"))
        }
        const newWaitlist = await WaitlistModel.insertOne({
            email: email.toLowerCase()
        });

        if (!newWaitlist) {
            return next(createError(500, unknown_error))
        }

        const { template, text, subject } = welcomeEmailTemplate(email);
        await sendEmail(email, subject, text, template);

        res.status(201).json({
            status: "success",
            message: "You've successfully joined the waitlist! 🎉 Stay tuned for updates and early access opportunities."
        })
    } catch (error) {
        console.error(`Unable to allow user join waitlist: ${error}`);
        return next(createError(500, server_error))
    }
}