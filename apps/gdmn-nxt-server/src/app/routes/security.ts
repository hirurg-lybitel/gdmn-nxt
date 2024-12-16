import { securityController } from '@gdmn-nxt/modules/security/controller';
import express from 'express';

const router = express.Router();

router.get('/security/active-sessions', securityController.getActiveSessions);
router.post('/security/closeSessionBySessionId/:id', securityController.closeSessionBySessionId);

export const securityRouter = router;

