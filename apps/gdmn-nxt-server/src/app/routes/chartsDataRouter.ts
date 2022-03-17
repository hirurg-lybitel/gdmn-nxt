import express from 'express';
import chartsData from '../handlers/chartsData';

const router = express.Router();
router.get('/charts/sumbyperiod', chartsData.getSumByPeriod);

export default router;
