import express from 'express';
import reportsApi from './api/reports';

const router = express.Router();

router.use('/reports', reportsApi);

export default router;
