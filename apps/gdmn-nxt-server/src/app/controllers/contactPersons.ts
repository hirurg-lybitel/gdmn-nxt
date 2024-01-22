import { IContactPerson, IRequestResult } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { resultError } from '../responseMessages';
import { cachedRequets } from '../utils/cached requests';
import { contactPersonsRepository } from '@gdmn-nxt/repositories/contacts/contactPersons';
import { cacheManager } from '@gdmn-nxt/cache-manager';

const getById: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res
      .status(422)
      .send(resultError('Field ID is not defined or is not numeric'));
  }
  try {
    const persons = await contactPersonsRepository.find(req.sessionID, { id });
    res
      .status(200)
      .json({
        queries: {
          persons
        },
        _params: [{ id }]
      });
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

const getAll: RequestHandler = async (req, res) => {
  /** Pagination */
  const { pageSize, pageNo } = req.query;
  /** Sorting */
  const { field: sortField = 'NAME', sort: sortMode = 'ASC' } = req.query;
  /** Filtering */
  const customerId = parseInt(req.query.customerId as string);
  const { name } = req.query;

  let fromRecord = 0;
  let toRecord: number;

  if (pageNo && pageSize) {
    fromRecord = Number(pageNo) * Number(pageSize);
    toRecord = fromRecord + Number(pageSize);
  };

  try {
    const cachedPersons = await cacheManager.getKey<IContactPerson[]>('customerPersons') ?? [];

    const persons = cachedPersons
      .reduce((filteredArray, person) => {
        let checkConditions = true;

        if (customerId) {
          checkConditions = checkConditions &&
          person.WCOMPANYKEY === customerId;
        }

        if (name) {
          const lowerName = String(name).toLowerCase();
          checkConditions = checkConditions && (
            person.NAME?.toLowerCase().includes(lowerName) ||
            person.EMAILS?.some(({ EMAIL }) => EMAIL.toLowerCase().includes(lowerName)) ||
            person.PHONES?.some(({ USR$PHONENUMBER }) => USR$PHONENUMBER.includes(lowerName))
          );
        }

        if (checkConditions) {
          filteredArray.push({
            ...person,
          });
        }
        return filteredArray;
      }, [])
      .sort((a, b) => {
        const nameA = a[String(sortField).toUpperCase()]?.toLowerCase() || '';
        const nameB = b[String(sortField).toUpperCase()]?.toLowerCase() || '';

        return String(sortMode).toUpperCase() === 'ASC'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });

    const rowCount = persons.length;
    const personsWitPagination = persons.slice(fromRecord, toRecord);

    res
      .status(200)
      .json({
        queries: {
          persons: personsWitPagination,
          rowCount
        }
      });
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

const createContact: RequestHandler = async (req, res) => {
  try {
    const newPerson = await contactPersonsRepository.save(req.sessionID, req.body);
    const persons = await contactPersonsRepository.find(req.sessionID, { id: newPerson.ID });

    cachedRequets.cacheRequest('customerPersons');

    const result: IRequestResult = {
      queries: { persons },
      _schema: {}
    };
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

const removeById: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res
      .status(422)
      .send(resultError('Field ID is not defined or is not numeric'));
  }

  try {
    const person = await contactPersonsRepository.remove(req.sessionID, id);
    if (!person.ID) {
      return res.sendStatus(404);
    }
    cachedRequets.cacheRequest('customerPersons');

    const result: IRequestResult = {
      queries: { persons: [person] },
      _params: [{ id }],
      _schema: {}
    };

    res
      .status(200)
      .json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

const updateById: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res
      .status(422)
      .send(resultError('Field ID is not defined or is not numeric'));
  }
  try {
    const updatedPerson = await contactPersonsRepository.update(req.sessionID, id, req.body);
    if (!updatedPerson.ID) {
      return res.sendStatus(404);
    }
    const persons = await contactPersonsRepository.find(req.sessionID, { id: updatedPerson.ID });

    cachedRequets.cacheRequest('customerPersons');

    const result: IRequestResult = {
      queries: { persons },
      _schema: {}
    };
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

const getHistory: RequestHandler = async (req, res) => {
  const personId = parseInt(req.params.id);
  if (isNaN(personId)) {
    return res.sendStatus(422);
  }
  // try {
  //   const clientHistory = await contactPersonsRepository.getHistory(req.sessionID, cardId);
  //   const result: IRequestResult = {
  //     queries: {
  //       clientHistory
  //     },
  //     _params: [{ cardId }],
  //     _schema
  //   };
  //   return res.status(200).json(result);
  // } catch (error) {
  //   return res.status(500).send(resultError(error.message));
  // }
};

export const contactPersonsController = {
  getById,
  getAll,
  createContact,
  updateById,
  removeById
};
