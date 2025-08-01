import express from 'express';
import { addLabelsContact, deleteLabelsContact, getLabelsContact } from '../../controllers/labelsContact';
import { contactPersonsController } from '../../controllers/contacts/contactPersons';
import contactEmployees from '../../controllers/contactEmployees';
import { favoriteContactsController } from '@gdmn-nxt/controllers/contacts/favoriteContacts';
import { customerController } from '@gdmn-nxt/modules/customers/controller';

const router = express.Router();

router.get('/', customerController.getContacts);
router.get('/customerId/:customerId', customerController.getContacts);
router.get('/taxId/:taxId', customerController.getContacts);
router.get('/rootId/:rootId', customerController.getContacts);
router.put('/:id', customerController.updateContact);
router.post('/', customerController.createContact);

router.post('/tickets', customerController.addToTickets);
router.put('/tickets/:id', customerController.updateTicketsContact);
router.delete('/tickets/:customerId', customerController.removeFromTickets);

router.delete('/:id', customerController.deleteContact);
router.get('/hierarchy', customerController.getContactHierarchy);
router.get('/labels/:contactId', getLabelsContact);
router.get('/labels', getLabelsContact);
router.post('/labels', addLabelsContact);
router.delete('/labels/:contactId', deleteLabelsContact);

router.put('/persons/many', contactPersonsController.updateMany);
router.get('/persons', contactPersonsController.getAll);
router.get('/persons/:id', contactPersonsController.getById);
router.post('/persons', contactPersonsController.createContact);
router.put('/persons/:id', contactPersonsController.updateById);
router.delete('/persons/:id', contactPersonsController.removeById);

router.get('/employees/:id', contactEmployees.get);
router.get('/employees', contactEmployees.get);

router.get('/customerscross', customerController.getCustomersCross);

router.post('/favorites/:contactId', favoriteContactsController.createFavorite);
router.delete('/favorites/:contactId', favoriteContactsController.removeByContact);

export default router;
