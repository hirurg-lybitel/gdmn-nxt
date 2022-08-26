import express, { Router } from 'express';
import perm from '../../handlers/permissions';

const router = express.Router();

router.get('/', perm.getCross);
router.put('/', perm.upsertCross);
router.get('/actions', perm.getActions);
router.get('/userGroups', perm.getUserGroups);
router.post('/userGroups', perm.upsertGroup);
router.put('/userGroups/:id', perm.upsertGroup);
router.delete('/userGroups/:id', perm.removeGroup);

router.get('/userGroups/:id/users', perm.getUserByGroup);

router.post('/usergroupsline', perm.addUserGroupLine);
router.delete('/usergroupsline/:id', perm.removeUserGroupLine);

export default router;
