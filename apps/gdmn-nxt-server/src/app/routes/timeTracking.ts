
import { timeTrackingProjectTypesController } from '@gdmn-nxt/modules/time-tracker-project-types/controller';
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

// projects routes

router.get('/time-tracking/projects', timeTrackerProjectsController.findAll);
router.post('/time-tracking/projects', timeTrackerProjectsController.create);
router.put('/time-tracking/projects/:id', timeTrackerProjectsController.update);
router.delete('/time-tracking/projects/:id', timeTrackerProjectsController.remove);

router.post('/time-tracking/projects/favorites/:id', timeTrackerProjectsController.addToFavorites);
router.delete('/time-tracking/projects/favorites/:id', timeTrackerProjectsController.removeFromFavorites);

router.get('/time-tracking/projects/filters', timeTrackerProjectsController.getFilters);
router.get('/time-tracking/projects/statistics/:id', timeTrackerProjectsController.statistics);

// project types routes

router.get('/time-tracking/projectTypes', timeTrackingProjectTypesController.findAll);
router.post('/time-tracking/projectTypes', timeTrackingProjectTypesController.create);
router.put('/time-tracking/projectTypes/:id', timeTrackingProjectTypesController.update);
router.delete('/time-tracking/projectTypes/:id', timeTrackingProjectTypesController.remove);

// tasks routes

router.get('/time-tracking/tasks', timeTrackerTasksController.findAll);
router.get('/time-tracking/tasks/:id', timeTrackerTasksController.findById);
router.post('/time-tracking/tasks', timeTrackerTasksController.create);
router.put('/time-tracking/tasks/:id', timeTrackerTasksController.update);
router.delete('/time-tracking/tasks/:id', timeTrackerTasksController.remove);

router.post('/time-tracking/tasks/favorites/:id', timeTrackerTasksController.addToFavorites);
router.delete('/time-tracking/tasks/favorites/:id', timeTrackerTasksController.removeFromFavorites);

export const timeTrackingRouter = router;

