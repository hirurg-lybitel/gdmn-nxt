import { ISegment, InternalServerErrorException, Like, NotFoundException } from '@gsbelarus/util-api-types';
import { segmentsRepository } from '../repository';
import { ERROR_MESSAGES } from '@gdmn/constants/server';
import { forEachAsync } from '@gsbelarus/util-helpers';
import { customersRepository } from '@gdmn-nxt/repositories/customers';

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
  // includeSegments.forEach(s => {
  //   console.log('s.FIELDS', s.FIELDS);
  // });

  const customersMap = new Map();

  await forEachAsync(includeSegments, async (s) => {
    const fields = [...s.FIELDS];

    // console.log('fields', fields);

    const LABELS = fields.find(f => f.NAME === 'LABELS');
    const DEPARTMENTS = fields.find(f => f.NAME === 'DEPARTMENTS');
    const BUSINESSPROCESSES = fields.find(f => f.NAME === 'BUSINESSPROCESSES');

    // console.log('LABELS', LABELS);

    const customers = await customersRepository.find('', {
      LABELS: LABELS?.VALUE ?? '',
      DEPARTMENTS: DEPARTMENTS?.VALUE ?? '',
      BUSINESSPROCESSES: BUSINESSPROCESSES?.VALUE ?? '',
    });

    customers.forEach(({ ID, ...c }) => {
      if (customersMap.has(ID)) {
        return;
      };
      customersMap.set(ID, c);
    });
  });

  await forEachAsync(excludeSegments, async (s) => {
    const fields = [...s.FIELDS];

    // console.log('fields', fields);

    const LABELS = fields.find(f => f.NAME === 'LABELS');
    const DEPARTMENTS = fields.find(f => f.NAME === 'DEPARTMENTS');
    const BUSINESSPROCESSES = fields.find(f => f.NAME === 'BUSINESSPROCESSES');

    // console.log('LABELS', LABELS);

    const customers = await customersRepository.find('', {
      LABELS: LABELS?.VALUE ?? '',
      DEPARTMENTS: DEPARTMENTS?.VALUE ?? '',
      BUSINESSPROCESSES: BUSINESSPROCESSES?.VALUE ?? '',
    });

    customers.forEach(({ ID, ...c }) => {
      if (!customersMap.has(ID)) {
        return;
      };

      customersMap.delete(ID);
    });
  });

  // console.log('customersMap', customersMap);

  return customersMap.size;
};

export const segmentsService = {
  findAll,
  findOne,
  createSegment,
  updateById,
  removeById,
  calcCustomersCount
};
