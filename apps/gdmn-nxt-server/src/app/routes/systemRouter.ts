import express from 'express';
import systemApi from './api/system';

const router = express.Router();

router.use('/system', systemApi);

export default router;
