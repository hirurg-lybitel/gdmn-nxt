import express from 'express';
import theme from '../handlers/theme';

const router = express.Router();
router.get('/theme/:userId', theme.get);
router.put('/theme/:userId', theme.upsert);
router.post('/theme/:userId', theme.upsert);
router.delete('/theme/:userId', theme.remove);

export default router;