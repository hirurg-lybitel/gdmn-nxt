import express from 'express';
import profileSettings from '../controllers/profileSettings';

const router = express.Router();
router.get('/profile-settings/userId/:userId', profileSettings.get);
router.put('/profile-settings/userId/:userId', profileSettings.set);

export default router;
