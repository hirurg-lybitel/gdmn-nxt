import { ColorMode, authResult } from '@gsbelarus/util-api-types';
import express from 'express';
import passport from 'passport';
export const router = express.Router();

router.post('/user/signin', passport.authenticate('local'), function(req, res) {
  console.log('signin', req.sessionID);
  const { userName } = req.body;
  const { id: userId, permissions } = req.user as any;

  const prevSession = req.session;

  req.session.regenerate((err) => {
    Object.assign(req.session, prevSession);
    req.session.userId = userId;
    req.session.permissions = permissions;

    return res.json(authResult(
      'SUCCESS',
      `Вы вошли как ${userName}.`
    ));
  });
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) console.error(err);
    });
  }
  res.sendStatus(200);
});

router.get('/user', (req, res) => {
  // console.log('user', req.user);
  if (req.isAuthenticated()) {
    res.cookie('userId', req.user?.['id']);
    res.cookie('color-mode', req.user?.['colorMode'] || ColorMode.Light);
    return res.json({
      result: true,
      user: req.user,
    }
    );
  } else {
    return res.json({
      result: false,
      user: null,
    });
  }
});

router.post('/user/forgot-password', async (req, res) => {
  const { email } = req.body;
  /*  1. проверим входные параметры на корректность  */

  if (typeof email !== 'string') {
    return res.json(authResult('INVALID_DATA', 'Invalid data.'));
  }

  return res.sendStatus(500);
});

export const authRouter = router;
