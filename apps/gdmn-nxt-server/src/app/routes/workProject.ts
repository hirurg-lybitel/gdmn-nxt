import { workProjectsController } from '@gdmn-nxt/modules/work-projects/controller';
import express from 'express';

const router = express.Router();

router.get('/work-projects', workProjectsController.findAll);
router.post('/work-projects', workProjectsController.create);
router.put('/work-projects/:id', workProjectsController.update);
router.delete('/work-projects/:id', workProjectsController.remove);
router.post('/work-projects/favorites/:id', workProjectsController.addToFavorites);
router.delete('/work-projects/favorites/:id', workProjectsController.removeFromFavorites);

export const workProjectsRouter = router;

