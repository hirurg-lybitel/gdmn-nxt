import express from 'express';
import sqlEditor from '../../controllers/sqlEditor';
import systemUsers from '../../controllers/systemUsers';


const router = express.Router();

router.get('/sql-editor/history', sqlEditor.getHistory);
router.post('/sql-editor', sqlEditor.executeScript);
router.get('/users', systemUsers.get);
router.get('/users/:id', systemUsers.get);

export default router;
