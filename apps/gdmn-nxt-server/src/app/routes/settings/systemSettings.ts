import express from 'express';
import { systemSettingsController } from '@gdmn-nxt/controllers/settings/systemSettings';

const systemSettingsRouter = express.Router();
systemSettingsRouter.get('/system-settings', systemSettingsController.getAll);
systemSettingsRouter.put('/system-settings/:id', systemSettingsController.updateById);

export default systemSettingsRouter;
