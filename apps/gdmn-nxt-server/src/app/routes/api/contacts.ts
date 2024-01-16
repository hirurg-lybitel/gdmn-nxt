import express from 'express';
import { deleteContact, getContactHierarchy, getContacts, getCustomersCross, upsertContact } from '../../controllers/contacts';
import { addLabelsContact, deleteLabelsContact, getLabelsContact } from '../../controllers/labelsContact';
import { contactPersonsController } from '../../controllers/contactPersons';
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

router.get('/persons', contactPersonsController.getAll);
router.get('/persons/:id', contactPersonsController.getById);
router.post('/persons', contactPersonsController.createContact);
router.put('/persons/:id', contactPersonsController.updateById);
router.delete('/persons/:id', contactPersonsController.removeById);

router.get('/employees/:id', contactEmployees.get);
router.get('/employees', contactEmployees.get);

router.get('/customerscross', getCustomersCross);

export default router;
