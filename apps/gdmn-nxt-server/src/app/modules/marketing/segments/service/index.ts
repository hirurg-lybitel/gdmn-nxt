import { ICustomer, ISegment, InternalServerErrorException, Like, NotFoundException } from '@gsbelarus/util-api-types';
import { segmentsRepository } from '../repository';
import { ERROR_MESSAGES } from '@gdmn/constants/server';
import { forEachAsync } from '@gsbelarus/util-helpers';
import { customersRepository } from '@gdmn-nxt/repositories/customers';
import timersPromises from 'timers/promises';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  try {
    const pageSize = filter?.pageSize;
    const pageNo = filter?.pageNo;
    const name = filter?.name;

    const sortField = filter.field ?? 'NAME';
    const sortMode = filter.sort ?? 'ASC';

    const segments = await segmentsRepository.find(
      sessionID,
      {
        ...(name && { USR$NAME: Like(name) }),
      },
      {
        [sortField]: sortMode
      }
    );

    let fromRecord = 0;
    let toRecord: number;

    if (pageNo && pageSize) {
      fromRecord = Number(pageNo) * Number(pageSize);
      toRecord = fromRecord + Number(pageSize);
    };

    const segmentsWithPagination = segments.slice(fromRecord, toRecord);
    const count = segments.length;

    return {
      segments: segmentsWithPagination,
      count
    };
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const findOne = async (
  sessionID: string,
  id: number
) => {
  try {
    const segments = await segmentsRepository.findOne(sessionID, { ID: id });
    if (!segments?.ID) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND);
    }

    return segments;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const createSegment = async (
  sessionID: string,
  body: Omit<ISegment, 'ID'>
) => {
  try {
    const newSegment = await segmentsRepository.save(sessionID, body);
    const segment = await segmentsRepository.findOne(sessionID, { id: newSegment.ID });

    return segment;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const updateById = async (
  sessionID: string,
  id: number,
  body: Omit<ISegment, 'ID'>
) => {
  try {
    const updatedSegment = await segmentsRepository.update(sessionID, id, body);
    if (!updatedSegment?.ID) {
      throw NotFoundException(`Не найден сегмент с id=${id}`);
    }
    const segment = await segmentsRepository.findOne(sessionID, { id: updatedSegment.ID });

    return segment;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const removeById = async (
  sessionID: string,
  id: number
) => {
  try {
    const checkSegment = await segmentsRepository.findOne(sessionID, { ID: id });
    if (!checkSegment?.ID) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND);
    }

    return await segmentsRepository.remove(sessionID, id);
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const calcCustomersCount = async (
  sessionID: string,
  includeSegments: ISegment[],
  excludeSegments: ISegment[]
) => {
  const customersMap = new Map();

  await forEachAsync(includeSegments, async (s) => {
    const customersIds = s.CUSTOMERS ?? [];

    customersIds.forEach(id => {
      if (customersMap.has(id)) {
        return;
      };
      customersMap.set(id, id);
    });

    if (customersIds.length > 0) {
      return;
    }

    const fields = [...s.FIELDS];

    const LABELS = fields.find(f => f.NAME === 'LABELS');
    const DEPARTMENTS = fields.find(f => f.NAME === 'DEPARTMENTS');
    const BUSINESSPROCESSES = fields.find(f => f.NAME === 'BUSINESSPROCESSES');
    const CONTRACTS = fields.find(f => f.NAME === 'CONTRACTS');
    const WORKTYPES = fields.find(f => f.NAME === 'WORKTYPES');

    const customers = await customersRepository.find('', {
      LABELS: LABELS?.VALUE ?? '',
      DEPARTMENTS: DEPARTMENTS?.VALUE ?? '',
      BUSINESSPROCESSES: BUSINESSPROCESSES?.VALUE ?? '',
      CONTRACTS: CONTRACTS?.VALUE ?? '',
      WORKTYPES: WORKTYPES?.VALUE ?? '',
    });

    customers.forEach(({ ID, ...c }) => {
      if (customersMap.has(ID)) {
        return;
      };
      customersMap.set(ID, c);
    });
  });

  await forEachAsync(excludeSegments, async (s) => {
    const customersIds = s.CUSTOMERS ?? [];

    customersIds.forEach(id => {
      if (!customersMap.has(id)) {
        return;
      };
      customersMap.delete(id);
    });

    if (customersIds.length > 0) {
      return;
    }

    const fields = [...s.FIELDS];

    const LABELS = fields.find(f => f.NAME === 'LABELS');
    const DEPARTMENTS = fields.find(f => f.NAME === 'DEPARTMENTS');
    const BUSINESSPROCESSES = fields.find(f => f.NAME === 'BUSINESSPROCESSES');
    const CONTRACTS = fields.find(f => f.NAME === 'CONTRACTS');
    const WORKTYPES = fields.find(f => f.NAME === 'WORKTYPES');

    const customers = await customersRepository.find('', {
      LABELS: LABELS?.VALUE ?? '',
      DEPARTMENTS: DEPARTMENTS?.VALUE ?? '',
      BUSINESSPROCESSES: BUSINESSPROCESSES?.VALUE ?? '',
      CONTRACTS: CONTRACTS?.VALUE ?? '',
      WORKTYPES: WORKTYPES?.VALUE ?? '',
    });

    customers.forEach(({ ID, ...c }) => {
      if (!customersMap.has(ID)) {
        return;
      };

      customersMap.delete(ID);
    });
  });

  return customersMap.size;
};

const getSegmentsCustomers = async (
  sessionID = 'getSegmentsCustomers',
  includeSegments: ISegment[],
  excludeSegments: ISegment[]
) => {
  const customersArray: ICustomer[] = [];

  await forEachAsync(includeSegments, async (s) => {
    const customersIds = s.CUSTOMERS ?? [];

    await forEachAsync(customersIds, async id => {
      const findIndex = customersArray.findIndex(({ ID }) => ID === id);
      if (findIndex >= 0) return;

      const customer = await customersRepository.findOne(sessionID, id);
      customersArray.push(customer);
    });

    if (customersIds.length > 0) {
      return;
    }

    const fields = [...s.FIELDS];

    const LABELS = fields.find(f => f.NAME === 'LABELS');
    const DEPARTMENTS = fields.find(f => f.NAME === 'DEPARTMENTS');
    const BUSINESSPROCESSES = fields.find(f => f.NAME === 'BUSINESSPROCESSES');
    const CONTRACTS = fields.find(f => f.NAME === 'CONTRACTS');
    const WORKTYPES = fields.find(f => f.NAME === 'WORKTYPES');

    const customers = await customersRepository.find(sessionID, {
      LABELS: LABELS?.VALUE ?? '',
      DEPARTMENTS: DEPARTMENTS?.VALUE ?? '',
      BUSINESSPROCESSES: BUSINESSPROCESSES?.VALUE ?? '',
      CONTRACTS: CONTRACTS?.VALUE ?? '',
      WORKTYPES: WORKTYPES?.VALUE ?? '',
    });

    customers.forEach((c) => {
      const findIndex = customersArray.findIndex(({ ID }) => ID === c.ID);
      if (findIndex >= 0) return;

      customersArray.push(c);
    });
  });

  await forEachAsync(excludeSegments, async (s) => {
    const customersIds = s.CUSTOMERS ?? [];

    await forEachAsync(customersIds, async id => {
      const findIndex = customersArray.findIndex(({ ID }) => ID === id);
      if (findIndex < 0) return;

      customersArray.splice(findIndex, 1);
    });

    if (customersIds.length > 0) {
      return;
    }

    const fields = [...s.FIELDS];

    const LABELS = fields.find(f => f.NAME === 'LABELS');
    const DEPARTMENTS = fields.find(f => f.NAME === 'DEPARTMENTS');
    const BUSINESSPROCESSES = fields.find(f => f.NAME === 'BUSINESSPROCESSES');
    const CONTRACTS = fields.find(f => f.NAME === 'CONTRACTS');
    const WORKTYPES = fields.find(f => f.NAME === 'WORKTYPES');

    const customers = await customersRepository.find('', {
      LABELS: LABELS?.VALUE ?? '',
      DEPARTMENTS: DEPARTMENTS?.VALUE ?? '',
      BUSINESSPROCESSES: BUSINESSPROCESSES?.VALUE ?? '',
      CONTRACTS: CONTRACTS?.VALUE ?? '',
      WORKTYPES: WORKTYPES?.VALUE ?? '',
    });

    customers.forEach((c) => {
      const findIndex = customersArray.findIndex(({ ID }) => ID === c.ID);
      if (findIndex < 0) return;

      customersArray.splice(findIndex, 1);
    });
  });

  // return customersMap;
  return customersArray;
};

export const segmentsService = {
  findAll,
  findOne,
  createSegment,
  updateById,
  removeById,
  calcCustomersCount,
  getSegmentsCustomers
};
