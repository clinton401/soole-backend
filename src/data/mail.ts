
import nodemailer from 'nodemailer';
// import {NOBOX_UPL}
import axios from "axios";
import {NOBOX_TOKEN, NOBOX_PROJECT, NOBOX_ENDPOINT, NOBOX_UPLOAD_URL} from "../config/variables"
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async (to: string, subject: string, text: string, content: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html: content
  };

  try {
    await transporter.sendMail(mailOptions);
    // const response = await axios.post(`${NOBOX_UPLOAD_URL}/${NOBOX_PROJECT}/send-email?to=${to}&raw=1`, {
    //   content,
    //   subject,
    // }, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${NOBOX_TOKEN}`
    //   }
    // });
    // return response;
  } catch (err) {
  
    console.error(`Failed to send email: ${(err as Error).message}`);
    
    // throw new Error((err as Error).message); 
  }
};
