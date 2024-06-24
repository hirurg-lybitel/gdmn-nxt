import { RequestHandler } from 'express';
import passport from 'passport';
import { profileSettingsController } from './settings/profileSettings';
import { IConfirmation, authResult } from '@gsbelarus/util-api-types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages';
import { config } from '@gdmn-nxt/config';
import jwt from 'jsonwebtoken';
import { jwtExpirationTime } from '../constants/params';
import { generateSecret, verifyCode } from '@gdmn/2FA';
import { sendEmail } from '@gdmn/mailer';
import { confirmationsRepository } from '@gdmn-nxt/repositories/confirmations';
import { randomFixedNumber } from '@gsbelarus/util-useful';
import fs from 'fs';
import path from 'path';
import Mustache from 'mustache';
import svgCaptcha from 'svg-captcha';

const confirmationCodeHtml = fs.readFileSync(path.join(__dirname, 'assets', 'mail.html'), { encoding: 'utf-8' });

interface Info {
  origin?: string;
  userAgent?: string;
  userName?: string;
}

/** Send verification code to Email */
const sendEmailConfirmation = async (userId: number, email: string, info?: Info) => {
  const subject = 'Подтверждение адреса электронной почты';
  const from = `GDMN CRM <${process.env.SMTP_USER}>`;

  const generatedNumber = randomFixedNumber(6);

  const newConfirmation: IConfirmation = {
    ID: -1,
    CODE: generatedNumber,
    EMAIL: email,
    USER: userId
  };

  const confirmation = await confirmationsRepository.create('mailer', newConfirmation);

  if (!confirmation) return false;

  const view = {
    userName: info.userName ?? 'пользователь',
    code: confirmation.CODE,
    location: 'Минск, Беларусь',
    originIP: info.origin ?? 'Неизвестно',
    device: info.userAgent ?? 'Неизвестно'
  };

  const renderedHtml = Mustache.render(confirmationCodeHtml, view);

  await sendEmail(
    from,
    email,
    subject,
    '',
    renderedHtml);

  return true;
};

const signIn: RequestHandler = async (req, res, next) => {
  passport.authenticate('local', async function(err, user, info) {
    if (err) {
      return next(err);
    }

    const { userName } = req.body;

    if (user) {
      const result = await profileSettingsController.getSettings(user.id, req);
      const { REQUIRED_2FA, ENABLED_2FA, EMAIL, SECRETKEY, LAST_IP } = result.settings;


      /** Require captcha for new address only */
      const IP = req.socket.remoteAddress;
      if (IP !== LAST_IP) {
        req.session.userId = user.id;
        return res.json(authResult(
          'REQUIRED_CAPTCHA',
          'Требуется пройти дополнительную проверку.'
        ));
      }

      /** If the user have to enter a 2FA code */
      if (ENABLED_2FA) {
        req.session.base32Secret = SECRETKEY;
        req.session.userId = user.id;
        req.session.email = EMAIL;
        req.session.userName = user.userName;

        return res.json(authResult(
          'ENABLED_2FA',
          'Требуется подтвердить код 2FA.'
        ));
      }

      /** If the user have to enable 2FA */
      if (REQUIRED_2FA) {
        /** Если в базе нет email, и нам прислали новый, на который надо зарегистрировать */
        if (EMAIL) {
          req.session.userId = user.id;
          req.session.email = EMAIL;
          req.session.userName = user.userName;

          return res.json(authResult(
            'REQUIRED_2FA',
            ERROR_MESSAGES.AUTH_FAILED_TFA_REQUIRED,
          ));
        }

        if (!EMAIL) {
          return res.json(authResult(
            'ERROR',
            ERROR_MESSAGES.AUTH_FAILED_TFA_NO_EMAIL
          ));
        }

        return res.json(authResult(
          'REQUIRED_2FA',
          ERROR_MESSAGES.AUTH_FAILED_TFA_REQUIRED,
          { userName, email: EMAIL }
        ));
      }

      /** If the user doesn't have to use 2FA */
      return req.login(user, loginErr => {
        if (loginErr) {
          return next(loginErr);
        }

        const prevSession = req.session;
        req.session.regenerate((err) => {
          Object.assign(req.session, prevSession);
          req.session.userId = user.id;
          req.session.base32Secret = '';
          req.session.token = jwt.sign({ EMAIL }, config.jwtSecret, { expiresIn: jwtExpirationTime });

          return res.json(authResult(
            'SUCCESS',
            `Вы вошли как ${userName}.`
          ));
        });
      });
    }

    res.json(authResult(
      'ERROR',
      info?.message ?? ''
    ));
  })(req, res, next);
};

const signIn2fa: RequestHandler = async (req, res, next) => {
  passport.authenticate('local', async function(err, user, info) {
    if (err) {
      return next(err);
    }

    const { authCode } = req.body;
    const { base32Secret } = req.session;
    const { email, userName } = user;

    const checkAuthCode = await verifyCode(email, authCode, base32Secret);

    if (!checkAuthCode) {
      return res.json(authResult(
        'ERROR',
        ERROR_MESSAGES.TFA_CODE_INVALID
      ));
    }

    return req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      }

      const prevSession = req.session;
      req.session.regenerate((err) => {
        Object.assign(req.session, prevSession);
        req.session.base32Secret = base32Secret;
        req.session.token = jwt.sign({ email }, config.jwtSecret, { expiresIn: jwtExpirationTime });

        return res.json(authResult(
          'SUCCESS',
          `Вы вошли как ${userName}.`
        ));
      });
    });
  })(req, res, next);
};

const startCreate2fa: RequestHandler = async (req, res) => {
  const { email, userId, userName } = (() =>
    req.user
      ? {
        email: req.user['email'],
        userId: req.user['id'],
        userName: req.user['userName']
      }
      : { ...req.session })();

  if (!email) {
    return res.json(authResult(
      'ERROR',
      ERROR_MESSAGES.AUTH_FAILED_TFA_NO_EMAIL
    ));
  }

  const { qr, base32Secret } = await generateSecret(email);

  await profileSettingsController.upsertSecretKey(req, { secretKey: base32Secret, email, userId });

  req.session.base32Secret = base32Secret;

  const info: Info = {
    origin: req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    userName
  };

  try {
    const codeSent = await sendEmailConfirmation(userId, email, info);

    if (!codeSent) {
      return res.json(authResult(
        'ERROR',
        ERROR_MESSAGES.SEND_EMAIL_ERROR,
      ));
    };
  } catch ({ message }) {
    return res.json(authResult(
      'ERROR',
      `${ERROR_MESSAGES.SEND_EMAIL_ERROR} ${message}`,
    ));
  }

  return res.json(authResult(
    'SUCCESS',
    '',
    { userName, email, qr, base32Secret }
  ));
};

const endCreate2fa: RequestHandler = async (req, res) => {
  const { authCode, emailCode } = req.body;
  const { base32Secret } = req.session;

  const { email, userId } = (() =>
    req.user
      ? {
        email: req.user['email'],
        userId: req.user['id'],
      }
      : { ...req.session })();

  const confirmation = await confirmationsRepository.getByEmail(req.sessionID, email);

  if (!confirmation.CODE) {
    return res.json(authResult(
      'ERROR',
      ERROR_MESSAGES.AUTH_FAILED_EMAIL_CODE_INVALID
    ));
  }

  if (confirmation.ATTEMPTS > 2) {
    return res.json(authResult(
      'ERROR',
      ERROR_MESSAGES.AUTH_FAILED_EMAIL_ATTEMPTS
    ));
  }

  const checkEmailCode = (() => confirmation.ID
    ? emailCode === confirmation.CODE
    : true)();

  if (!checkEmailCode) {
    await confirmationsRepository.updateAttempts(
      req.sessionID,
      confirmation.ID,
      confirmation.ATTEMPTS + 1
    );

    return res.json(authResult(
      'ERROR',
      ERROR_MESSAGES.AUTH_FAILED_EMAIL_CODE_INVALID
    ));
  }

  const checkAuthCode = await verifyCode(email, authCode.toString(), base32Secret);

  if (!checkAuthCode) {
    return res.json(authResult(
      'ERROR',
      ERROR_MESSAGES.TFA_CODE_INVALID
    ));
  }

  try {
    await confirmationsRepository.remove(req.sessionID, { USR$EMAIL: email });
    await profileSettingsController.upsertSecretKey(req, { userId, enabled2fa: true });

    return res.json(authResult(
      'SUCCESS',
      SUCCESS_MESSAGES.TFA_ACTIVATED
    ));
  } catch ({ message }) {
    console.error('[ create 2fa error ]', message);
    return res.json(authResult(
      'ERROR',
      message
    ));
  }
};

const logout: RequestHandler = async (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) console.error(err);
    });
  }
  res.sendStatus(200);
};

const userInfo: RequestHandler = async (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      result: true,
      user: req.user,
    });
  }
  return res.json({
    result: false,
    user: null,
  });
};

const forgotPassword: RequestHandler = async (req, res) => {
  const { email } = req.body;
  /*  1. проверим входные параметры на корректность  */

  if (typeof email !== 'string') {
    return res.json(authResult('INVALID_DATA', 'Invalid data.'));
  }

  return res.sendStatus(500);
};

const disable2fa: RequestHandler = async (req, res) => {
  const { code } = req.body;
  const userId = req.user['id'];

  try {
    const result = await profileSettingsController.getSettings(userId, req);
    const { SECRETKEY, EMAIL } = result.settings;

    const checkCode = await verifyCode(EMAIL, code.toString(), SECRETKEY);

    if (checkCode) {
      await profileSettingsController.upsertSecretKey(req, { userId, enabled2fa: false });

      return res.json(authResult(
        'SUCCESS',
        SUCCESS_MESSAGES.TFA_DISABLED
      ));
    }
    return res.json(authResult(
      'ERROR',
      ERROR_MESSAGES.TFA_CODE_INVALID
    ));
  } catch (error) {
    res.status(500).json(authResult(
      'ERROR',
      error
    ));
  }
};

const generateCaptcha: RequestHandler = async (req, res) => {
  const captcha = svgCaptcha.create({
    ignoreChars: 'iLl10I',
  });

  req.session.captcha = captcha.text;

  res.type('svg');
  res.status(200).send(captcha.data);
};

const verifyCaptcha: RequestHandler = async (req, res) => {
  const { value } = req.body;
  const { captcha, userId } = req.session;

  const checkCaptcha = captcha === value;
  if (!checkCaptcha) {
    return res.json(authResult(
      'ERROR',
      ERROR_MESSAGES.CAPTCHA_INVALID
    ));
  }

  const ip = req.socket.remoteAddress;
  const updateIP = await profileSettingsController.upsertLastIP(req, { userId, ip });

  if (!updateIP) {
    return res.json(authResult(
      'ERROR',
      ERROR_MESSAGES.ITERNAL_ERROR
    ));
  }

  res.json(authResult(
    'SUCCESS',
    SUCCESS_MESSAGES.CAPTCHA_VALID
  ));
};

export const authenticationController = {
  signIn,
  signIn2fa,
  startCreate2fa,
  endCreate2fa,
  logout,
  userInfo,
  forgotPassword,
  disable2fa,
  generateCaptcha,
  verifyCaptcha
};
