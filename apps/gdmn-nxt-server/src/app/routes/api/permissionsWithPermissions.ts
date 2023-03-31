import express from 'express';
import perm from '../../handlers/permissions';

const router = express.Router();

router.put('/', perm.upsertCross);
router.post('/userGroups', perm.upsertGroup);
router.put('/userGroups/:id', perm.upsertGroup);
router.delete('/userGroups/:id', perm.removeGroup);

router.post('/usergroupsline', perm.addUserGroupLine);
router.delete('/usergroupsline/:id', perm.removeUserGroupLine);

export default router;
