import express from 'express';
import dealsApi from './api/deals'

const router = express.Router();

router.use('/deals', dealsApi);

export default router;
