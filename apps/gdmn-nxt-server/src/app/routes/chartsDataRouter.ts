import express from 'express';
import * as chartsData from '../controllers/charts';

const router = express.Router();
router.get('/charts/sumbyperiod', chartsData.getSumByPeriod);
router.get('/charts/businessDirection', chartsData.getBusinessDirection);

export default router;
