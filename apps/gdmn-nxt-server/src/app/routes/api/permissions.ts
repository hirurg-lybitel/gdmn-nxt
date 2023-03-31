import express from 'express';
import perm from '../../handlers/permissions';

const router = express.Router();

router.get(`/actions`, perm.getActions);
router.get(`/actions/:actionCode/byUser/:userID`, perm.getPermissionByUser);
router.get(`/`, perm.getCross);
router.get('/userGroups', perm.getUserGroups);
router.get('/userGroups/:id/users', perm.getUserByGroup);
router.get('/usergroupsline/:groupId', perm.getUserGroupLine);

export default router;
