import { Response, Request, NextFunction } from "express";
import { RegisterSchema, OtpSchema, CompleteProfileSchema } from "../schemas";
import createError from "http-errors";
import { UserModel, User } from "../nobox/record-structures/user";
import { otpGenerator, hasExpired, userHandler, validatePhone, validateEmail } from "../lib/utils";
import { server_error, unknown_error } from "../lib/variables";
import { NumberVerificationModel } from "../nobox/record-structures/number-verification";
import { config } from "dotenv";
import cloudinary from "../config/cloudinary";
import fs from 'fs';
import { ZodError } from "zod";
import { hashPassword, validatePassword } from "../lib/password-utils";
import {generateAccessToken} from "../middlewares/access-tokens"

config();
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const values = req.body;
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return next(createError(400, "Phone number is required and must start with the country code (e.g. +234)."));
  }
  try {
    const { code, expiresAt } = otpGenerator();
    const { phone } = validatedFields.data;

    const isNumberAvailable = await UserModel.findOne({ phone });
    if (isNumberAvailable)
      return next(
        createError(
          400,
          "Phone number already registered. Please use a different number or log in if you already have an account."
        )
      );
    const user = await UserModel.insertOne({ ...values, isNumberVerified: false });

    if (!user) return next(createError(500, unknown_error));
    const params = {
      userId: user.id,
    };
    const isCodeAvailable = await NumberVerificationModel.findOne(params);
    if (!isCodeAvailable) {
      const body = {
        code,
        expiresAt: expiresAt.toISOString(),
        userId: user.id,
      };
      await NumberVerificationModel.insertOne(body);
    } else {
      await NumberVerificationModel.updateOneById(isCodeAvailable.id, {
        code,
        expiresAt: expiresAt.toISOString(),
      });
    }
    const userDetails = {
      id: user.id,
      number: user.phone
    }
    res.status(201).json({ status: "success", message: "User created successfully!. Verification code sent to your messages", user: userHandler(user) });

  } catch (error) {
    console.error(`Unable to register user: ${error}`);
    return next(createError(500, server_error));
  }
};

export const verifyNumber = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  const values = req.body;
  const validatedFields = OtpSchema.safeParse(values);
  if (!validatedFields.success) {
    return next(createError(400, "Code is required and must be 5 characters long."));
  }

  try {
    const { code } = validatedFields.data;
    const user = await UserModel.findOne({ id: userId });
    if (!user) return next(createError(400, "User not found."));
    if (user.isNumberVerified) {
      res.status(200).json({ status: "success", message: "Phone Number has already been registered" });
      return;

    }
    const foundToken = await NumberVerificationModel.findOne({ userId });
    if (!foundToken) return next(createError(400, "No verification token available for user."));
    const isExpired = hasExpired(new Date(foundToken.expiresAt));
    if (isExpired) {
      return next(createError(400, "Code has expired, generate a new one"));
    }
    const isCodeValid = code === foundToken.code;
    if (!isCodeValid) return next(createError(400, "Invalid code"));
    const data = {
      isNumberVerified: true,
    };
    const updatedUser = await UserModel.updateOneById(user.id, data);
    if (!updatedUser) return next(createError(500, unknown_error));
    await NumberVerificationModel.deleteOneById(foundToken.id);

    res.status(200).json({ status: "success", message: "Phone number verified successfully.", user: userHandler(updatedUser) });
  } catch (error) {
    console.error(`Unable to verify phone number: ${error}`);
    return next(createError(500, server_error));
  }

}

export const regenerateVerificationCode = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  try {
    const user = await UserModel.findOne({ id: userId });
    if (!user) return next(createError(400, "User not found."));
    if (user.isNumberVerified) {
      res.status(200).json({ status: "success", message: "Phone Number has already been registered" });
      return;

    }
    const { code, expiresAt } = otpGenerator();
    const isCodeAvailable = await NumberVerificationModel.findOne({ userId });
    if (!isCodeAvailable) {
      const body = {
        code,
        expiresAt: expiresAt.toISOString(),
        userId,
      };
      await NumberVerificationModel.insertOne(body);
    } else {
      await NumberVerificationModel.updateOneById(isCodeAvailable.id, {
        code,
        expiresAt: expiresAt.toISOString(),
      });
    }
    res.status(200).json({ status: "success", message: "New verification code sent to your messages" });

  } catch (error) {
    console.error(`Error while regenerating verification code: ${error}`);
    return next(createError(500, server_error))
  }
}


export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(createError(400, "No image uploaded"))

    }
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return next(createError(400, 'Invalid file type. Only images are allowed.'));
    }
    const upload_preset = process.env.CLOUDINARY_PRESET_NAME;
    if (!upload_preset) return next(createError(400, "Cloudinary preset name is required"));
    const filePath = req.file.path;


    const result = await cloudinary.uploader.upload(filePath, {
      upload_preset,
    });
    if (!result) return next(createError(500, unknown_error))
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Failed to delete file: ${filePath}. Error: ${err.message}`);
      }
    });
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully!',
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }

    });
  } catch (error) {
    console.error(`Unable to upload image to cloudinary: ${error}`)
    return next(createError(500, unknown_error))
  }
}

export const completeProfile = async (req: Request, res: Response, next: NextFunction) => {
  const values = req.body;
  const userId = req.params.id;
  try {
    const user = await UserModel.findOne({ id: userId });
    if (!user) return next(createError(400, "User not found."));
    if (user.email && user.password) return next(createError(400, "Profile is already complete. No further updates are allowed."))
    const validatedData = CompleteProfileSchema.parse(values);
    const isEmailTaken = await UserModel.findOne({ email: validatedData.email });
    if (isEmailTaken) return next(createError(400, "Email already registered. Please use a different one"))
    const { confirmPassword, ...cleanedData } = validatedData;
    const hashedPassword = await hashPassword(cleanedData.password)
    const dataToBeUpdated = {
      ...cleanedData,
      password: hashedPassword
    }
    const updatedUser = await UserModel.updateOneById(userId, dataToBeUpdated);
    if (!updatedUser) return next(createError(500, unknown_error))

    res.status(200).json({
      success: true,
      message: "User profile updated successfully.",
      user: userHandler(updatedUser)
    });

  } catch (err) {
    console.error(`Unable to complete user profile: ${err}`)
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      res.status(400).json({
        success: false,
        error: errors,
      });
      return
    }
    return next(createError(500, unknown_error))
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, email, password } = req.body;

  if (!password || (!phone && !email)) {
    return next(createError(400, "Incomplete credentials"));
  }
  if (phone && email) {
    return next(createError(400, "Please provide only one of phone or email, not both."))
  }

  try {
    let user: User & {
      id: string;
    } | null;
    if (phone) {
      if (!validatePhone(phone)) {
        return next(createError(400, "Phone not in correct format. Include country code."));

      }
      user = await UserModel.findOne({ phone });
      if (!user) {
        return next(createError(400, "User not found. Check phone number and try again."))
      }
    } else {
      if (!validateEmail(email)) {
        return next(createError(400, "Email not in correct format. Check the email address."));

      }
      user = await UserModel.findOne({ email })
      if (!user) {
        return next(createError(400, "User not found. Check email and try again."))
      }
    }
    if (!user?.password) {
      return next(createError(404, "No password found for this user."))
    }
    const isPasswordValid = await validatePassword(password, user.password);
    if (!isPasswordValid) {
      return next(createError(401, "Invalid credentials. Check password and try again"))
    }
    const access_token = generateAccessToken(user.id);
    res.status(200).json({ status: "success", message: "Login successful.", user: userHandler(user), access_token })
  } catch (error) {
    console.error(`Unable sign in user: ${error}`)
    return next(createError(500, server_error))
  }
}