import express from 'express';
import { PermissionsController } from '../controllers/permissions';

const router = express.Router();

router.put('/', PermissionsController.upsertCross);
router.post('/userGroups', PermissionsController.upsertGroup);
router.put('/userGroups/:id', PermissionsController.upsertGroup);
router.delete('/userGroups/:id', PermissionsController.removeGroup);
router.post('/usergroupsline', PermissionsController.upsertUserGroupLine);
router.post('/usersgroupsline', PermissionsController.upsertUsersGroupLine);
router.put('/usergroupsline/:id', PermissionsController.upsertUserGroupLine);
router.delete('/usergroupsline/:id', PermissionsController.removeUserGroupLine);
router.get('/actions', PermissionsController.getActions);
router.get('/actions/:actionCode/byUser/:userID', PermissionsController.getPermissionByUser);
router.get('/', PermissionsController.getCross);
router.get('/userGroups', PermissionsController.getUserGroups);
router.get('/userGroups/:id/users', PermissionsController.getUserByGroup);
router.post('/userGroups/closeSessionById/:id', PermissionsController.closeUserSessionById);
router.get('/usergroupsline/:groupId', PermissionsController.getUserGroupLineController);

export const permissionsRouter = express.Router().use('/permissions', router);
