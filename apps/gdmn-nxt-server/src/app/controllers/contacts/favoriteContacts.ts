import { cacheManager } from '@gdmn-nxt/cache-manager';
import { resultError } from '../../responseMessages';
import { IFavoriteContact, IRequestResult } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { favoriteContactsRepository } from '@gdmn-nxt/repositories/contacts/favoriteContacts';
import { cachedRequets } from '../../utils/cached requests';

const getAll: RequestHandler = async (req, res) => {
  try {
    const favorites = await cacheManager.getKey<IFavoriteContact[]>('favoriteContacts') ?? [];
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

const createFavorite: RequestHandler = async (req, res) => {
  const contactID = parseInt(req.params.contactId);
  if (isNaN(contactID)) {
    return res
      .status(422)
      .send(resultError('Field contactID is not defined or is not numeric'));
  }

  const { id: sessionID, userId } = req.session;

  try {
    const newFavorite = await favoriteContactsRepository.save(
      sessionID,
      userId,
      contactID
    );

    cachedRequets.cacheRequest('favoriteContacts');

    const persons = await favoriteContactsRepository.find(
      sessionID,
      {
        id: newFavorite.ID
      });


    const result: IRequestResult = {
      queries: { persons },
      _schema: {}
    };
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

const removeByContact: RequestHandler = async (req, res) => {
  const contactID = parseInt(req.params.contactId);
  if (isNaN(contactID)) {
    return res
      .status(422)
      .send(resultError('Field contactID is not defined or is not numeric'));
  }

  const { id: sessionID, userId } = req.session;

  try {
    const favorite = await favoriteContactsRepository.remove(
      sessionID,
      userId,
      contactID
    );
    if (!favorite.ID) {
      return res.sendStatus(404);
    }

    cachedRequets.cacheRequest('favoriteContacts');

    const result: IRequestResult = {
      queries: { favorites: [favorite] },
      _params: [{ contactID }],
      _schema: {}
    };

    res
      .status(200)
      .json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

export const favoriteContactsController = {
  getAll,
  createFavorite,
  removeByContact
};
