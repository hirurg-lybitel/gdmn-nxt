
import { timeTrackerProjectsController } from '@gdmn-nxt/modules/time-tracker-projects/controller';
import { timeTrackerTasksController } from '@gdmn-nxt/modules/time-tracker-tasks/controller';
import { timeTrackingController } from '@gdmn-nxt/modules/time-tracker/controller';
import express from 'express';

const router = express.Router();

router.get('/time-tracking', timeTrackingController.findAll);
router.get('/time-tracking/group', timeTrackingController.findAllByGroup);
router.get('/time-tracking/in-progress', timeTrackingController.findInProgress);
router.post('/time-tracking', timeTrackingController.create);
router.put('/time-tracking/:id', timeTrackingController.update);
router.delete('/time-tracking/:id', timeTrackingController.remove);

router.get('/time-tracking/tasks/:id', timeTrackerTasksController.findById);
router.get('/time-tracking/tasks', timeTrackerTasksController.findAll);
router.get('/time-tracking/projects', timeTrackerProjectsController.findAll);

router.post('/time-tracking/tasks/favorites/:id', timeTrackerTasksController.addToFavorites);
router.delete('/time-tracking/tasks/favorites/:id', timeTrackerTasksController.removeFromFavorites);

router.post('/time-tracking/projects/favorites/:id', timeTrackerProjectsController.addToFavorites);
router.delete('/time-tracking/projects/favorites/:id', timeTrackerProjectsController.removeFromFavorites);

export const timeTrackingRouter = router;

