import { workProjectsController } from '@gdmn-nxt/modules/work-projects/controller';
import express from 'express';

const router = express.Router();

router.get('/work-projects', workProjectsController.findAll);
router.post('/work-projects', workProjectsController.create);
router.put('/work-projects/:id', workProjectsController.update);
router.delete('/work-projects/:id', workProjectsController.remove);

export const workProjectsRouter = router;

