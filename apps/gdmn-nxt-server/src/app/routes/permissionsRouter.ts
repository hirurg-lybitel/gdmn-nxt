import express from 'express';
import permApi from './api/permissions';

const router = express.Router();
router.use('/permissions', permApi);

export default router;
