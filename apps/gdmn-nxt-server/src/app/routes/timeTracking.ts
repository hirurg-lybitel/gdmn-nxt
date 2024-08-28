
import { timeTrackingController } from '@gdmn-nxt/modules/time-tracker/controller';
import express from 'express';

const router = express.Router();

router.get('/time-tracking', timeTrackingController.findAll);
router.get('/time-tracking/group', timeTrackingController.findAllByGroup);
router.get('/time-tracking/in-progress', timeTrackingController.findInProgress);
router.post('/time-tracking', timeTrackingController.create);
router.put('/time-tracking/:id', timeTrackingController.update);
router.delete('/time-tracking/:id', timeTrackingController.remove);

export const timeTrackingRouter = router;

