import { RequestHandler } from 'express';
import { timeTrackerProjectsService } from '../service';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  const userId = req.user['id'];
  try {
    const response = await timeTrackerProjectsService.findAll(
      sessionID,
      {
        userId,
        ...req.query
      }
    );

    const result: IRequestResult = {
      queries: { timeTrackerProjects: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};


export const timeTrackerProjectsController = {
  findAll
};
