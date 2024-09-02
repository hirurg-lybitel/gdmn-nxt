import { RequestHandler } from 'express';
import { resultError } from '@gsbelarus/util-helpers';
import { contractsService } from '../service';

export const getAll: RequestHandler = async (req, res) => {
  const contractType = parseInt(req.params.contractType);

  if (isNaN(contractType)) {
    return res
      .status(422)
      .send(resultError('Field contractType is not defined or is not numeric'));
  }

  try {
    const response = await contractsService.findAll(
      req.sessionID,
      contractType,
      req.query
    );

    res
      .status(200)
      .json({
        queries: {
          ...response
        },
        _params: [{ contractType }]
      });
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const getDetailByContract: RequestHandler = async (req, res) => {
  const contractType = parseInt(req.params.contractType);
  if (isNaN(contractType)) {
    return res
      .status(422)
      .send(resultError('Field contractType is not defined or is not numeric'));
  }

  const contractId = parseInt(req.params.contractId);

  try {
    const response = await contractsService.getDetailByContract(
      req.sessionID,
      contractType,
      {
        ...req.body,
        contractId
      }
    );

    res
      .status(200)
      .json({
        queries: {
          contractDetails: response
        },
        _params: [{ contractType }]
      });
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const contractsController = {
  getAll,
  getDetailByContract
};
