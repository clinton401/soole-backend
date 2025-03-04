import { TERMII_SENDER_ID, TERMII_API_KEY } from "../config/variables";
import axios from "axios";
import { unknown_error } from "../lib/variables";


export const sendSMS = async (message: string, phoneNumber: string) => {
  try {
    const response = await axios.post(
     "https://v3.api.termii.com/api/sms/send",
      {
        to: phoneNumber,
        from: TERMII_SENDER_ID,
        sms: message,
        type: "plain",
        api_key: TERMII_API_KEY,
        channel: "dnd",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    if (response.data?.code === "ok") {
      return response?.data;
    } else {
      throw new Error(unknown_error);
    }
  } catch (error) {
    console.error(`Unable to send SMS: ${error}`);
    throw error;
  }
};
