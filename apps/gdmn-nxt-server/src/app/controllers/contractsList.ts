import { RequestHandler } from 'express';
import { resultError } from '../responseMessages';
import { contractsRepository } from '@gdmn-nxt/repositories/contracts';

export const getAllByCustomer: RequestHandler = async(req, res) => {
  const companyId = parseInt(req.params.companyId);
  const contractType = parseInt(req.params.contractType);

  if (isNaN(companyId)) {
    return res
      .status(422)
      .send(resultError('Field companyId is not defined or is not numeric'));
  }

  if (isNaN(contractType)) {
    return res
      .status(422)
      .send(resultError('Field contractType is not defined or is not numeric'));
  }

  try {
    const contracts = await contractsRepository.find(
      req.sessionID,
      {
        usr$contactkey: companyId,
        contractType
      });
    res
      .status(200)
      .json({
        queries: {
          contracts
        },
        _params: [{ companyId, contractType }]
      });
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

export const contractsController = {
  getAllByCustomer
};
