import { z } from "zod";

export const RegisterSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{1,14}$/, {
      message: "Invalid phone number format.",
    })
})
export const OtpSchema = z.object({
  code: z.string()
    .trim()
    .min(5, { message: "OTP must be at least 5 characters" })
    .max(5, { message: "OTP must be at most 5 characters" }),
});
export const CompleteProfileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(3, { message: "First name must be at least 3 characters long." })
      .max(50, { message: "First name must not exceed 50 characters." }),
    lastName: z
      .string()
      .trim()
      .min(3, { message: "Last name must be at least 3 characters long." })
      .max(50, { message: "Last name must not exceed 50 characters." }),
    email: z
      .string()
      .trim()
      .email({ message: "Invalid email format." })
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email address." }),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], {
      errorMap: () => ({ message: "Gender must be MALE, FEMALE, or OTHER." }),
    }),
    dob: z
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
    bio: z
      .string()
      .optional()
      .refine((bio) => !bio || bio.trim().split(/\s+/).length >= 1, {
        message: "Bio must have at least one word if provided.",
      }),
    username: z
      .string()
      .trim()
      .min(3, { message: "Username must be at least 3 characters long." })
      .max(50, { message: "Username must not exceed 50 characters." }),
      password: z
        .string()
        .trim()
        .min(6, { message: "Password must be at least 6 characters long." }),
    confirmPassword: z
      .string()
      .trim()
      .min(6, { message: "Confirm Password must be at least 6 characters long." }),
    avatarUrl: z
      .string()
      .url({ message: "Invalid avatar URL format." }),
    avatarPublicId: z
      .string()
      .trim()
      .min(1, { message: "Avatar public ID must not be empty if provided." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });


export const ScheduleTripSchema = z.object({
  pickup: z.string({
    required_error: "Pickup location is required.",
    invalid_type_error: "Pickup location must be a string.",
  }),
  destination: z.string({
    required_error: "Destination is required.",
    invalid_type_error: "Destination must be a string.",
  }),
  driverId: z.string({
    required_error: "Driver ID is required.",
    invalid_type_error: "Driver ID must be a string.",
  }),
  date: z.string({
    required_error: "Date is required.",
    invalid_type_error: "Date must be a string in ISO format.",
  }),
  estimatiedTime: z.string({
    required_error: "Estimated time is required.",
    invalid_type_error: "Estimated time must be a string.",
  }),
  vehicleModel: z.string({
    required_error: "Vehicle model is required.",
    invalid_type_error: "Vehicle model must be a string.",
  }),
  color: z.string({
    required_error: "Color is required.",
    invalid_type_error: "Color must be a string.",
  }),
  plateNumber: z.string({
    required_error: "Plate number is required.",
    invalid_type_error: "Plate number must be a string.",
  }),
  noOfSeats: z.number({
    required_error: "Number of seats is required.",
    invalid_type_error: "Number of seats must be a number.",
  }),
  pricePerSeat: z.number({
    required_error: "Price per seat is required.",
    invalid_type_error: "Price per seat must be a number.",
  }),
});


export const UpdateProfileSchema = z
  .object({
    phone: z
      .string()
      .trim()
      .regex(/^\+[1-9]\d{1,14}$/, {
        message: "Invalid phone number format.",
      }).optional(),
    firstName: z
      .string()
      .trim()
      .min(3, { message: "First name must be at least 3 characters long." })
      .max(50, { message: "First name must not exceed 50 characters." })
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(3, { message: "Last name must be at least 3 characters long." })
      .max(50, { message: "Last name must not exceed 50 characters." })
      .optional(),

    email: z
      .string()
      .trim()
      .email({ message: "Invalid email format." })
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email address." })
      .optional(),

    gender: z
      .enum(["MALE", "FEMALE", "OTHER"], {
        errorMap: () => ({ message: "Gender must be MALE, FEMALE, or OTHER." }),
      })
      .optional(),

    dob: z
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

    bio: z
      .string()
      .optional()
      .refine((bio) => !bio || bio.trim().split(/\s+/).length >= 1, {
        message: "Bio must have at least one word if provided.",
      }),

    username: z
      .string()
      .trim()
      .min(3, { message: "Username must be at least 3 characters long." })
      .max(50, { message: "Username must not exceed 50 characters." })
      .optional(),

    avatarUrl: z
      .string()
      .url({ message: "Invalid avatar URL format." })
      .optional(),

    avatarPublicId: z
      .string()
      .trim()
      .min(1, { message: "Avatar public ID must not be empty if provided." })
      .optional(),
  }).optional();

  export const RegisterAdminSchema = z.object({
    name: z
      .string()
      .trim()
      .min(3, { message: "Name must be at least 3 characters long." })
      .max(50, { message: "Name must not exceed 50 characters." }),
  
    workEmail: z
      .string()
      .trim()
      .email({ message: "Invalid  email format." }),
    personalEmail: z
      .string()
      .trim()
      .email({ message: "Invalid  email format." }),
  
    password: z
      .string()
      .trim()
      .min(6, { message: "Password must be at least 6 characters long." }),
  
 
  
    phone: z
      .string()
      .regex(/^\d+$/, { message: "Phone number must contain only digits." })
      .min(10, { message: "Phone number must be at least 10 digits long." })
      .max(15, { message: "Phone number must not exceed 15 digits." }),
  });
  
  export const AddNewAdminSchema = z.object({
    name: z
      .string()
      .trim()
      .min(3, { message: "Name must be at least 3 characters long." })
      .max(50, { message: "Name must not exceed 50 characters." }),
  
    workEmail: z
      .string()
      .trim()
      .email({ message: "Invalid  email format." }),
    personalEmail: z
      .string()
      .trim()
      .email({ message: "Invalid  email format." }),
  
   
  
 
  
    phone: z
      .string()
      .regex(/^\d+$/, { message: "Phone number must contain only digits." })
      .min(10, { message: "Phone number must be at least 10 digits long." })
      .max(15, { message: "Phone number must not exceed 15 digits." }),
  });
  
  export const UpdateAdminProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, { message: "Name must be at least 3 characters long." })
      .max(50, { message: "Name must not exceed 50 characters." })
      .optional(),

    workEmail: z.string().trim().email({ message: "Invalid email format." }).optional(),

    personalEmail: z.string().trim().email({ message: "Invalid email format." }).optional(),

    phone: z
      .string()
      .regex(/^\d+$/, { message: "Phone number must contain only digits." })
      .min(10, { message: "Phone number must be at least 10 digits long." })
      .max(15, { message: "Phone number must not exceed 15 digits." })
      .optional(),
      avatarUrl: z.string().url().optional()
  })
  .partial()
  .optional();



