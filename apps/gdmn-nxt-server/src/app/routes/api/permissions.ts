import express from 'express';
import perm from '../../handlers/permissions';

const router = express.Router();

router.get('/', perm.getCross);
router.put('/', perm.updateCross);
router.get('/actions', perm.getActions);
router.get('/userGroups', perm.getUserGroups);
router.post('/groups', perm.upsertGroup);
router.put('/groups/:id', perm.upsertGroup);
router.delete('/groups/:id', perm.removeGroup);

export default router;
