import express from 'express';
import { profileSettingsController } from '../../controllers/settings/profileSettings';

const router = express.Router();
router.get('/profile-settings/userId/:userId', profileSettingsController.get);
router.put('/profile-settings/userId/:userId', profileSettingsController.set);
router.post('/profile-settings/reset/:userId', profileSettingsController.resetSettings);

export default router;
