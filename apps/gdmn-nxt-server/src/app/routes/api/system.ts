import express from 'express';
import sqlEditor from '../../handlers/sqlEditor';
import systemUsers from '../../handlers/systemUsers';


const router = express.Router();

router.get('/sql-editor/history', sqlEditor.getHistory);
router.post('/sql-editor', sqlEditor.executeScript);
router.get('/users', systemUsers.get);
router.get('/users/:id', systemUsers.get);

export default router;
