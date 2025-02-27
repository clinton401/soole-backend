import { config } from "dotenv";
config();

const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
};

export const NOBOX_TOKEN = getEnvVariable("NOBOX_TOKEN");
export const NOBOX_ENDPOINT = getEnvVariable("NOBOX_ENDPOINT");
export const NOBOX_PROJECT = getEnvVariable("NOBOX_PROJECT");
export const NOBOX_UPLOAD_URL = getEnvVariable("NOBOX_UPLOAD_URL");
