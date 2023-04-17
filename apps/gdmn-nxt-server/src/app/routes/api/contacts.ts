import express from 'express';
import { deleteContact, getContactHierarchy, getContacts, getCustomersCross, updateContact, upsertContact } from '../../controllers/contacts';
import { addLabelsContact, deleteLabelsContact, getLabelsContact } from '../../controllers/labelsContact';
import contactPersons from '../../controllers/contactPersons';
import contactEmployees from '../../controllers/contactEmployees';

const router = express.Router();

router.get('/', getContacts);
router.get('/customerId/:customerId', getContacts);
router.get('/taxId/:taxId', getContacts);
router.get('/rootId/:rootId', getContacts);
router.put('/:id', upsertContact);
router.post('/', upsertContact);

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

router.get('/employees/:id', contactEmployees.get);
router.get('/employees', contactEmployees.get);

router.get('/customerscross', getCustomersCross);

export default router;
