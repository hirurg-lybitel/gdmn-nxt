import express from 'express';
import sqlEditor from '../../handlers/sqlEditor';


const router = express.Router();

router.get('/sql-editor/history', sqlEditor.getHistory);
router.post('/sql-editor', sqlEditor.executeScript);

export default router;
