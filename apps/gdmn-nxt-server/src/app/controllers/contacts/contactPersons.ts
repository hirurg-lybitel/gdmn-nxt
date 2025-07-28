import { IContactPerson, IFavoriteContact, IRequestResult } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { resultError } from '../../responseMessages';
import { cachedRequets } from '../../utils/cachedRequests';
import { contactPersonsRepository } from '@gdmn-nxt/repositories/contacts/contactPersons';
import { cacheManager } from '@gdmn-nxt/cache-manager';
import { forEachAsync } from '@gsbelarus/util-helpers';
import { systemSettingsRepository } from '@gdmn-nxt/repositories/settings/system';

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
  const { name, LABELS, COMPANY, RESPONDENTS, isFavorite, isOur, gedeminUser } = req.query;
  const labelIds = LABELS ? (LABELS as string).split(',').map(Number) ?? [] : [];
  const companyIds = COMPANY ? (COMPANY as string).split(',').map(Number) ?? [] : [];
  const respondentIds = RESPONDENTS ? (RESPONDENTS as string).split(',').map(Number) ?? [] : [];
  const favoriteOnly = (isFavorite as string)?.toLowerCase() === 'true';
  const ourCompanyOnly = (isOur as string)?.toLowerCase() === 'true';
  const gedeminUsersOnly = gedeminUser === 'true';

  /** Session data */
  const userId = req.user['id'];

  let fromRecord = 0;
  let toRecord: number;

  if (pageNo && pageSize) {
    fromRecord = Number(pageNo) * Number(pageSize);
    toRecord = fromRecord + Number(pageSize);
  };

  try {
    const systemSettings = await systemSettingsRepository.findOne(req.sessionID);
    const ourCompanyId = systemSettings.OURCOMPANY?.ID;

    const cachedPersons = await cacheManager.getKey<IContactPerson[]>('customerPersons') ?? [];

    const favoritesMap: Record<string, number[]> = {};
    const favorites = await cacheManager.getKey<IFavoriteContact[]>('favoriteContacts') ?? [];
    favorites.forEach(f => {
      if (favoritesMap[f.USER]) {
        favoritesMap[f.USER].push(f.CONTACT.ID);
      } else {
        favoritesMap[f.USER] = [f.CONTACT.ID];
      }
    });

    const persons = cachedPersons
      .reduce<IContactPerson[]>((filteredArray, person) => {
        let checkConditions = true;

        if (gedeminUsersOnly) {
          checkConditions = checkConditions && person.ISGEDEMINUSER;
        }

        if (customerId) {
          checkConditions = checkConditions &&
            person.COMPANY?.ID === customerId;
        }

        if (LABELS) {
          checkConditions = checkConditions &&
            person.LABELS?.some(l => labelIds.includes(l.ID));
        }

        if (COMPANY) {
          checkConditions = checkConditions &&
            companyIds?.includes(person.COMPANY?.ID);
        }

        if (RESPONDENTS) {
          checkConditions = checkConditions &&
            respondentIds?.includes(person.RESPONDENT?.ID);
        }

        if (name) {
          const lowerName = String(name).toLowerCase();
          checkConditions = checkConditions && (
            person.NAME?.toLowerCase().includes(lowerName) ||
            person.RANK?.toLowerCase().includes(lowerName) ||
            person.COMPANY?.NAME?.toLowerCase().includes(lowerName) ||
            person.EMAILS?.some(({ EMAIL }) => EMAIL.toLowerCase().includes(lowerName)) ||
            person.PHONES?.some(({ USR$PHONENUMBER }) => USR$PHONENUMBER.includes(lowerName)) ||
            person.MESSENGERS?.some(({ USERNAME }) => USERNAME.includes(lowerName)) ||
            person.LABELS?.some(({ USR$NAME }) => USR$NAME.includes(lowerName))
          );
        }

        const isFavorite = !!favoritesMap[userId]?.some(f => f === person.ID);
        if (favoriteOnly) {
          checkConditions = checkConditions &&
            isFavorite && favoriteOnly;
        }

        if (ourCompanyOnly) {
          checkConditions = checkConditions &&
            (person.COMPANY && person.COMPANY?.ID === ourCompanyId);
        }

        if (checkConditions) {
          filteredArray.push({
            ...person,
            isFavorite
          });
        }
        return filteredArray;
      }, [])
      .sort((a, b) => {
        const nameA = a[String(sortField).toUpperCase()]?.toLowerCase() || '';
        const nameB = b[String(sortField).toUpperCase()]?.toLowerCase() || '';
        if (a.isFavorite === b.isFavorite) {
          return String(sortMode).toUpperCase() === 'ASC'
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        }
        return a.isFavorite ? -1 : 1;
      });

    const rowCount = persons.length;
    const personsWithPagination = persons.slice(fromRecord, toRecord);

    res
      .status(200)
      .json({
        queries: {
          persons: personsWithPagination,
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
    if (!updatedPerson?.ID) {
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

const updateMany: RequestHandler = async (req, res) => {
  try {
    const persons: IContactPerson[] = req.body;

    const updatedPersons = await forEachAsync(persons, async ({ ID, ...person }: IContactPerson) => {
      if (isNaN(ID)) {
        return;
      }

      const updatedPerson = await contactPersonsRepository.update(req.sessionID, ID, person);
      if (!updatedPerson?.ID) {
        return;
      }

      const personInfo = await contactPersonsRepository.findOne(req.sessionID, { id: updatedPerson.ID });

      return personInfo;
    });

    if (updatedPersons.includes(undefined)) {
      return res.sendStatus(500);
    }

    cachedRequets.cacheRequest('customerPersons');

    const result: IRequestResult = {
      queries: { persons: updatedPersons },
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
  updateMany,
  removeById
};
