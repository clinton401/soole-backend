import { User } from "../nobox/record-structures/user";


declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user: User & {
        id: string;
    } 
    }
  }
}
export const errorHandler = (error: string, code: number) => {
  return {
    error,
    code

  };
};
const generateRandomNumbers = (numLength = 5) => {
  const availableNumbers = "0123456789";
  let randomNumbers = "";

  for (let i = 0; i < numLength; i++) {
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    randomNumbers += availableNumbers[randomIndex];
  }

  return randomNumbers;
};


export const otpGenerator = (is1Hr = false) => {
  const code = "00000";

  const additionNumber = !is1Hr ? 600000 : 3_600_000;
  const expiresAt = new Date(Date.now() + additionNumber);

  return { code, expiresAt };
};

export const hasExpired = (expiresAt: Date): boolean => {
  return expiresAt < new Date();
};
export const userHandler = (user: User) => {
  const { password, ...cleanedUser } = user;
  return cleanedUser
}



export const validatePhone = (phone: string) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};


export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

