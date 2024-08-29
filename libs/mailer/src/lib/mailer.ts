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

export const sendEmail = async (
  from: string,
  to: string,
  subject: string,
  text?: string,
  html?: string,
  attachments?: IAttachment[]
) => {
  try {
    return transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      attachments });
  } catch (error) {
    console.error('sendEmail_error', error);
  }
};

export const sendEmailByTestAccount = async (
  from: string,
  to: string,
  subject: string,
  text?: string,
  html?: string,
  attachments?: IAttachment[]
) => {
  const response = {
    accepted: [],
    rejected: []
  };
  nodemailer.createTestAccount((err, account) => {
    if (err) {
      console.error('Failed to create a testing account. ' + err.message);
      return process.exit(1);
    }

    console.log('Credentials obtained, sending message...');

    // Create a SMTP transporter object
    const transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });

    // Message object
    const message = {
      from,
      to,
      subject,
      text,
      html,
      attachments
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log('Error occurred. ' + err.message);
        return process.exit(1);
      }

      response.accepted.push(...info.accepted);
      response.rejected.push(...info.rejected);


      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      const url = nodemailer.getTestMessageUrl(info);
      console.log('Preview URL: %s', url);
    });
  });

  return response;
};


