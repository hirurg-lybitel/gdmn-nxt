import express from 'express';
import { jwtMiddleware } from '../middlewares/jwt';
import { authenticationController } from '@gdmn-nxt/controllers/authentication';

export const router = express.Router();

router.post('/user/signin', authenticationController.signIn);
router.post('/user/signin-2fa', authenticationController.signIn2fa);
router.get('/user/create-2fa', authenticationController.startCreate2fa);
router.post('/user/create-2fa', authenticationController.endCreate2fa);
router.get('/logout', authenticationController.logout);
router.get('/user', authenticationController.userInfo);
router.post('/user/forgot-password', authenticationController.forgotPassword);
router.post('/user/disable-2fa', jwtMiddleware, authenticationController.disable2fa);
router.get('/captcha', authenticationController.generateCaptcha);
router.post('/captcha/verify', authenticationController.verifyCaptcha);
router.post('/user/change-password', authenticationController.changePassword);

export const authRouter = router;
