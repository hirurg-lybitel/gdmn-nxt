import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';
import Mail = require('nodemailer/lib/mailer');

dotenv.config({ path: '../../..' });

export type IAttachment = Mail.Attachment;

const securePorts = [465, 587];

export type SmtpOptions = {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
}

type SendEmailOpt = {
  from: string,
  to: string,
  subject: string,
  text?: string,
  html?: string,
  attachments?: IAttachment[],
  options?: SmtpOptions
}

export const sendEmail = async ({
  from,
  to,
  subject,
  text,
  html,
  attachments,
  options = {}
}: SendEmailOpt) => {
  try {
    const {
      host = process.env.SMTP_HOST,
      port = 465,
      user = process.env.SMTP_USER,
      password: pass = process.env.SMTP_PASSWORD ?? ''
    } = options;

    const secure = securePorts.includes(port);

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      ...(!secure ? {
        requireTLS: false,
        tls: {
          rejectUnauthorized: false
        }
      } : {})
    });

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


