import twilio from "twilio";

export const twillio = async (body: string, toNumber: string) => {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_NUMBER;

  if (!twilioAccountSid) throw new Error("Twilio Account SID is required.");
  if (!twilioAuthToken) throw new Error("Twilio Auth Token is required.");
  if (!twilioNumber) throw new Error("Twilio Number is required.");
  try {
    const client = twilio(twilioAccountSid, twilioAuthToken);

    const message = await client.messages.create({
      body,
      from: twilioNumber,
      to: toNumber,
    });
    return message;
  } catch (err) {
    throw err;
  }
};
