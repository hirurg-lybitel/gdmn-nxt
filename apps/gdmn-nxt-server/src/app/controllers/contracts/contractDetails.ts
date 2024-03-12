import { RequestHandler } from 'express';
import { resultError } from '../../responseMessages';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { contractDetailRepository } from '@gdmn-nxt/repositories/contracts/contractDetails';

export const getByContract: RequestHandler = async (req, res) => {
  const contractType = parseInt(req.params.contractType);
  if (isNaN(contractType)) {
    return res
      .status(422)
      .send(resultError('Field contractType is not defined or is not numeric'));
  }

  const contractId = parseInt(req.params.contractId);

  try {
    const contractDetails = await contractDetailRepository.find(
      req.sessionID,
      {
        contractType,
        masterkey: contractId
      });

    const result: IRequestResult = {
      queries: {
        contractDetails,
      },
    };

    res
      .status(200)
      .json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

export const contractDetailsController = {
  getByContract
};
