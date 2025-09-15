import { IRequestResult } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { resultError } from '../../responseMessages';
import { systemSettingsRepository } from '@gdmn-nxt/repositories/settings/system';
import { cachedRequets } from '../../utils/cachedRequests';

const getAll: RequestHandler = async (req, res) => {
  try {
    const putPermission = req.user['permissions']['system']['PUT'];

    const settings = { ...(await systemSettingsRepository.findOne(req.sessionID)) };

    if (!putPermission) {
      delete settings.smtpHost;
      delete settings.smtpPassword;
      delete settings.smtpPort;
      delete settings.smtpUser;
    }

    const result: IRequestResult = {
      queries: { settings: [settings] },
      _schema: {}
    };
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

const updateById: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const upsertedSettings = await (() =>
      isNaN(id) || id <= 0
        ? systemSettingsRepository.save(req.sessionID, req.body)
        : systemSettingsRepository.update(req.sessionID, id, req.body)
    )();

    if (!upsertedSettings?.ID) {
      return res.sendStatus(404);
    }

    cachedRequets.cacheRequests(['contracts']);

    const settings = await systemSettingsRepository.findOne(req.sessionID, { id: upsertedSettings.ID });

    const result: IRequestResult = {
      queries: { settings: [settings] },
      _schema: {}
    };
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

export const systemSettingsController = {
  getAll,
  updateById
};
