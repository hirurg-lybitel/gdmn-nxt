import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';

dotenv.config({ path: '../../..' });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = (from: string, to: string, subject: string, text: string) => transporter.sendMail({ from, to, subject, text });
