"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteProfileSchema = exports.OtpSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z.object({
    phone: zod_1.z
        .string()
        .trim()
        .regex(/^\+[1-9]\d{1,14}$/, {
        message: "Invalid phone number format.",
    })
});
exports.OtpSchema = zod_1.z.object({
    code: zod_1.z.string()
        .trim()
        .min(5, { message: "OTP must be at least 5 characters" })
        .max(5, { message: "OTP must be at most 5 characters" }),
});
exports.CompleteProfileSchema = zod_1.z
    .object({
    firstName: zod_1.z
        .string()
        .trim()
        .min(3, { message: "First name must be at least 3 characters long." })
        .max(50, { message: "First name must not exceed 50 characters." }),
    lastName: zod_1.z
        .string()
        .trim()
        .min(3, { message: "Last name must be at least 3 characters long." })
        .max(50, { message: "Last name must not exceed 50 characters." }),
    email: zod_1.z
        .string()
        .trim()
        .email({ message: "Invalid email format." })
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email address." }),
    gender: zod_1.z.enum(["MALE", "FEMALE", "OTHER"], {
        errorMap: () => ({ message: "Gender must be MALE, FEMALE, or OTHER." }),
    }),
    dob: zod_1.z
        .string()
        .regex(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/, {
        message: "Date of Birth must be in the format dd-mm-yyyy.",
    })
        .refine((dob) => {
        const [day, month, year] = dob.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        const today = new Date();
        return date <= today;
    }, { message: "Date of Birth cannot be in the future." }),
    bio: zod_1.z
        .string()
        .optional()
        .refine((bio) => !bio || bio.trim().split(/\s+/).length >= 1, {
        message: "Bio must have at least one word if provided.",
    }),
    username: zod_1.z
        .string()
        .trim()
        .min(3, { message: "Username must be at least 3 characters long." })
        .max(50, { message: "Username must not exceed 50 characters." }),
    password: zod_1.z
        .string()
        .trim()
        .min(6, { message: "Password must be at least 6 characters long." }),
    confirmPassword: zod_1.z
        .string()
        .trim()
        .min(6, { message: "Confirm Password must be at least 6 characters long." }),
    avatarUrl: zod_1.z
        .string()
        .url({ message: "Invalid avatar URL format." }),
    avatarPublicId: zod_1.z
        .string()
        .trim()
        .min(1, { message: "Avatar public ID must not be empty if provided." }),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});
