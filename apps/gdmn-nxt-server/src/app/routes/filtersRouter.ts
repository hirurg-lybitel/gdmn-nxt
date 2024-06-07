import express from 'express';
import { filtersController } from '@gdmn-nxt/modules/filters/controller';

const router = express.Router();

router.get('/filters', filtersController.findAll);
router.get('/filters/:entityName', filtersController.findAll);
router.post('/filters', filtersController.createFilter);
router.put('/filters/:id', filtersController.updateById);
router.delete('/filters/:id', filtersController.removeById);

export const filtersRouter = router;
