import { User } from "../nobox/record-structures/user";
import validator from 'validator';


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
export const validateDOB = (dob: string ) => {
const dobRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
return dobRegex.test(dob)
}

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isCreditCardValid = (cardNumber: string): boolean => {
  return validator.isCreditCard(cardNumber);
}

export const  validateExpiryDate = (expiryDate: string): string | undefined => {
  const [month, year] = expiryDate.split('/').map(Number);

 
  if (!month || !year || month < 1 || month > 12) {
    return 'Invalid expiry date format. Use MM/YY.';
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; 
  const currentMonth = currentDate.getMonth() + 1; 


  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'The expiry date is in the past.';
  }


  return ;
}
