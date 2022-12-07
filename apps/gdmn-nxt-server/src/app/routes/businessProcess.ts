import express from 'express';
import businessProcesses from '../handlers/businessProcess';

const router = express.Router();
router.get('/business-processes', businessProcesses.get);

export default router;
