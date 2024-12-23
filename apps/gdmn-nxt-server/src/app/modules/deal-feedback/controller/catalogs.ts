import { RequestHandler } from 'express';
import { dealFeedbackCatalogs } from '../service/catalogs';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { resultError } from '@gsbelarus/util-helpers';

const findAllCompetences: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  try {
    const response = await dealFeedbackCatalogs.findAllCompetences(sessionID);

    const result: IRequestResult = {
      queries: { competences: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const findAllResults: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  try {
    const response = await dealFeedbackCatalogs.findAllResults(sessionID);

    const result: IRequestResult = {
      queries: { results: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const findAllSatisfactions: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  try {
    const response = await dealFeedbackCatalogs.findAllSatisfactions(sessionID);

    const result: IRequestResult = {
      queries: { satisfactions: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const findAllSatisfactionRates: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  try {
    const response = await dealFeedbackCatalogs.findAllSatisfactionRates(sessionID);

    const result: IRequestResult = {
      queries: { satisfactionRates: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const dealFeedbackCatalogsController = {
  findAllCompetences,
  findAllResults,
  findAllSatisfactions,
  findAllSatisfactionRates
};
