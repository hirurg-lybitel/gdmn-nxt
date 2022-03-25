import express from 'express';
import contactsApi from './api/contacts';

const router = express.Router();

router.use('/contacts', contactsApi);

export default router;
