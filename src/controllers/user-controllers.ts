import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { UserModel } from "../nobox/record-structures/user";
import { PaymentMethodModel } from "../nobox/record-structures/payment-method";
import { server_error, unknown_error, unauthorized_error } from "../lib/variables";
import { isCreditCardValid, validateExpiryDate, userHandler } from "../lib/utils";

export const addPaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
    const { cardNumber, cvv, expiryDate } = req.body;
    const userId = req.userId;
    if (!userId) return next(createError(401, unauthorized_error));
    if (!cardNumber || !cvv || !expiryDate) {
        return next(createError(400, "All fields are required."))
    }

    try {
        if (!isCreditCardValid(cardNumber)) return next(createError(400, "Invalid credit card number."))
        const expiryValidationError = validateExpiryDate(expiryDate);
        if (expiryValidationError) return next(createError(400, expiryValidationError));
        if (cvv.length !== 3) return next(createError(400, "CVV must be 3 digits."));
        const foundCard = await PaymentMethodModel.findOne({
            cardNumber, userId
        }, {});
        if (foundCard) return next(createError(400, "Card already exists. Please use a different card."))
        const card = await PaymentMethodModel.insertOne({ cardNumber, cvv, expiryDate, userId });
        if (!card) return next(createError(500, unknown_error))
        res.status(201).json({ status: "success", message: 'Payment method added successfully.', card });
    } catch (error) {
        console.error(`Unable to add payment method: ${error}`);
        return next(createError(500, server_error));
    }

}
export const deletePaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    try {
        const card = await PaymentMethodModel.findOne({ id }, {});
        if (!card) return next(createError(400, "Card not found. Please check and try again."));
        await PaymentMethodModel.deleteOneById(id);
        res.status(201).json({ status: "success", message: 'Payment method deleted successfully.', });
    } catch (error) {
        console.error(`Unable to delete payment method: ${error}`);
        return next(createError(500, server_error));
    }

}

export const getPaymentMethods = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return next(createError(401, unauthorized_error));
    try {
        const cards = await PaymentMethodModel.find({ userId }, {});
        if (cards.length < 1) return next(createError(404, "No payment methods found. Please add a card to your account."));
        res.status(200).json({
            status: "success",
            message: "Payment methods retrieved successfully.",
            cards
        })
    } catch (error) {
        console.error(`Unable to get payment methods: ${error}`);
        return next(createError(500, server_error));
    }
}