import bcrypt from "bcrypt";

const hashPassword = async (password: string): Promise< string> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error(`Unable to hash Password: ${error}`);
  throw error
  }
};

const validatePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  } catch (error) {
    console.error(`Unable to validate Password: ${error}`);
    throw error;
  }
};

export { hashPassword, validatePassword };
