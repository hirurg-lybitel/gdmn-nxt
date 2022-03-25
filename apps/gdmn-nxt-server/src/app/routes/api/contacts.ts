import express from 'express';
import { addContact, deleteContact, getContactHierarchy, getContacts, updateContact } from '../../contacts';
import { addLabelsContact, deleteLabelsContact, getLabelsContact } from '../../labels';
import contactPersons from '../../handlers/contactPersons';

const router = express.Router();

router.get('/', getContacts);
router.get('/taxId/:taxId', getContacts);
router.get('/rootId/:rootId', getContacts);
router.put('/:id', updateContact);
router.post('/', addContact);
router.delete('/:id', deleteContact);
router.get('/hierarchy', getContactHierarchy);
router.get('/labels/:contactId', getLabelsContact);
router.get('/labels', getLabelsContact);
router.post('/labels', addLabelsContact);
router.delete('/labels/:contactId', deleteLabelsContact);

router.get('/persons/customerId/:customerId', contactPersons.getByCutomerId);
router.get('/persons/:id', contactPersons.get);
router.post('/persons', contactPersons.upsert);
router.put('/persons/:id', contactPersons.upsert);
router.delete('/persons/:id', contactPersons.remove);

export default router;
