import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';
import Mail = require('nodemailer/lib/mailer');

dotenv.config({ path: '../../..' });

export type IAttachment = Mail.Attachment

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = (
  from: string,
  to: string,
  subject: string,
  text?: string,
  html?: string,
  attachments?: IAttachment[]
) => transporter.sendMail({
  from,
  to,
  subject,
  text,
  html,
  attachments });
