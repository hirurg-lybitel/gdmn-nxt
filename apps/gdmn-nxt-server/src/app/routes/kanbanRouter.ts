import express from 'express';
import kanbanApi from './api/kanban';


const router = express.Router();

router.use('/kanban', kanbanApi);

export default router;
