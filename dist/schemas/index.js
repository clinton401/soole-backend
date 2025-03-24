"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinWailtlistSchema = exports.UpdateAdminProfileSchema = exports.AddNewAdminSchema = exports.RegisterAdminSchema = exports.UpdateProfileSchema = exports.ScheduleTripSchema = exports.CompleteProfileSchema = exports.OtpSchema = exports.RegisterSchema = void 0;
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
    // avatarPublicId: z
    //   .string()
    //   .trim()
    //   .min(1, { message: "Avatar public ID must not be empty if provided." }),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});
exports.ScheduleTripSchema = zod_1.z.object({
    pickup: zod_1.z.string({
        required_error: "Pickup location is required.",
        invalid_type_error: "Pickup location must be a string.",
    }),
    destination: zod_1.z.string({
        required_error: "Destination is required.",
        invalid_type_error: "Destination must be a string.",
    }),
    driverId: zod_1.z.string({
        required_error: "Driver ID is required.",
        invalid_type_error: "Driver ID must be a string.",
    }),
    date: zod_1.z.string({
        required_error: "Date is required.",
        invalid_type_error: "Date must be a string in ISO format.",
    }),
    estimatiedTime: zod_1.z.string({
        required_error: "Estimated time is required.",
        invalid_type_error: "Estimated time must be a string.",
    }),
    vehicleModel: zod_1.z.string({
        required_error: "Vehicle model is required.",
        invalid_type_error: "Vehicle model must be a string.",
    }),
    color: zod_1.z.string({
        required_error: "Color is required.",
        invalid_type_error: "Color must be a string.",
    }),
    plateNumber: zod_1.z.string({
        required_error: "Plate number is required.",
        invalid_type_error: "Plate number must be a string.",
    }),
    noOfSeats: zod_1.z.number({
        required_error: "Number of seats is required.",
        invalid_type_error: "Number of seats must be a number.",
    }),
    pricePerSeat: zod_1.z.number({
        required_error: "Price per seat is required.",
        invalid_type_error: "Price per seat must be a number.",
    }),
});
exports.UpdateProfileSchema = zod_1.z
    .object({
    phone: zod_1.z
        .string()
        .trim()
        .regex(/^\+[1-9]\d{1,14}$/, {
        message: "Invalid phone number format.",
    }).optional(),
    firstName: zod_1.z
        .string()
        .trim()
        .min(3, { message: "First name must be at least 3 characters long." })
        .max(50, { message: "First name must not exceed 50 characters." })
        .optional(),
    lastName: zod_1.z
        .string()
        .trim()
        .min(3, { message: "Last name must be at least 3 characters long." })
        .max(50, { message: "Last name must not exceed 50 characters." })
        .optional(),
    email: zod_1.z
        .string()
        .trim()
        .email({ message: "Invalid email format." })
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email address." })
        .optional(),
    gender: zod_1.z
        .enum(["MALE", "FEMALE", "OTHER"], {
        errorMap: () => ({ message: "Gender must be MALE, FEMALE, or OTHER." }),
    })
        .optional(),
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
    }, { message: "Date of Birth cannot be in the future." })
        .optional(),
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
        .max(50, { message: "Username must not exceed 50 characters." })
        .optional(),
    avatarUrl: zod_1.z
        .string()
        .url({ message: "Invalid avatar URL format." })
        .optional(),
}).optional();
exports.RegisterAdminSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(3, { message: "Name must be at least 3 characters long." })
        .max(50, { message: "Name must not exceed 50 characters." }),
    workEmail: zod_1.z
        .string()
        .trim()
        .email({ message: "Invalid  email format." }),
    personalEmail: zod_1.z
        .string()
        .trim()
        .email({ message: "Invalid  email format." }),
    password: zod_1.z
        .string()
        .trim()
        .min(6, { message: "Password must be at least 6 characters long." }),
    phone: zod_1.z
        .string()
        .regex(/^\d+$/, { message: "Phone number must contain only digits." })
        .min(10, { message: "Phone number must be at least 10 digits long." })
        .max(15, { message: "Phone number must not exceed 15 digits." }),
});
exports.AddNewAdminSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(3, { message: "Name must be at least 3 characters long." })
        .max(50, { message: "Name must not exceed 50 characters." }),
    workEmail: zod_1.z
        .string()
        .trim()
        .email({ message: "Invalid  email format." }),
    personalEmail: zod_1.z
        .string()
        .trim()
        .email({ message: "Invalid  email format." }),
    phone: zod_1.z
        .string()
        .regex(/^\d+$/, { message: "Phone number must contain only digits." })
        .min(10, { message: "Phone number must be at least 10 digits long." })
        .max(15, { message: "Phone number must not exceed 15 digits." }),
});
exports.UpdateAdminProfileSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .trim()
        .min(3, { message: "Name must be at least 3 characters long." })
        .max(50, { message: "Name must not exceed 50 characters." })
        .optional(),
    workEmail: zod_1.z.string().trim().email({ message: "Invalid email format." }).optional(),
    personalEmail: zod_1.z.string().trim().email({ message: "Invalid email format." }).optional(),
    phone: zod_1.z
        .string()
        .regex(/^\d+$/, { message: "Phone number must contain only digits." })
        .min(10, { message: "Phone number must be at least 10 digits long." })
        .max(15, { message: "Phone number must not exceed 15 digits." })
        .optional(),
    avatarUrl: zod_1.z.string().url().optional()
})
    .partial()
    .optional();
exports.JoinWailtlistSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .email({ message: "Invalid  email format." })
});
