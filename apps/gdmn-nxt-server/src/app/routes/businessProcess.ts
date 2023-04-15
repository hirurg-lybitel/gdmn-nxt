import express from 'express';
import businessProcesses from '../controllers/businessProcess';

const router = express.Router();
router.get('/business-processes', businessProcesses.get);

export default router;
