import { cacheManager } from '@gdmn-nxt/cache-manager';
import { ContractType, IContract, InternalServerErrorException } from '@gsbelarus/util-api-types';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { contractDetailRepository } from '../repository/contractDetails';
import { contractsRepository } from '../repository';
import { systemSettingsRepository } from '@gdmn-nxt/repositories/settings/system';
dayjs.extend(isBetween);

const findAll = async (
  sessionID: string,
  contractType?: number,
  filter?: { [key: string]: any }
) => {
  try {
    /** Pagination */
    const pageSize = filter?.pageSize;
    const pageNo = filter?.pageNo;
    /** Sorting */
    const sortField = filter?.field ?? 'NAME';
    const sortMode = filter?.sort ?? 'ASC';
    /** Filtering */
    const customerId = parseInt(filter?.companyId as string);
    const name = filter?.name;
    const customers = filter?.customers;
    const dateRange = filter?.dateRange;
    const isActive = filter?.isActive;
    const customerIds = customers ? (customers as string).split(',').map(Number) ?? [] : [];
    const activeOnly = (isActive as string)?.toLowerCase() === 'true';
    const period = dateRange ? (dateRange as string).split(',') : [];

    let fromRecord = 0;
    let toRecord: number;

    if (pageNo && pageSize) {
      fromRecord = Number(pageNo) * Number(pageSize);
      toRecord = fromRecord + Number(pageSize);
    };

    const cachedContracts = await cacheManager.getKey<IContract[]>('contracts') ?? [];

    const contracts = cachedContracts
      .reduce<IContract[]>((filteredArray, contract) => {
        let checkConditions = true;

        if (customerId) {
          checkConditions = checkConditions &&
            contract.customer?.ID === customerId;
        }

        if (name) {
          const lowerName = String(name).toLowerCase();
          checkConditions = checkConditions && (
            contract.NUMBER?.toLowerCase().includes(lowerName) ||
            contract.customer.NAME?.toLowerCase().includes(lowerName)
          );
        }

        if (customerIds.length > 0) {
          checkConditions = checkConditions &&
            customerIds?.includes(contract.customer.ID);
        }

        if (period.length > 0) {
          checkConditions = checkConditions &&
            dayjs(contract.DATEEND).isBetween(period[0], period[1], 'day', '[]');
        }

        if (activeOnly) {
          checkConditions = checkConditions &&
            contract.ISACTIVE;
        }

        if (checkConditions) {
          filteredArray.push({
            ...contract
          });
        }
        return filteredArray;
      }, [])
      .sort((a, b) => {
        const dataType = typeof (a[String(sortField).toUpperCase()] ?? b[String(sortField).toUpperCase()]);

        const nameA = (() => {
          const fieldValue = a[String(sortField).toUpperCase()];
          if (dataType === 'string') {
            return fieldValue?.toLowerCase() || '';
          }
          return fieldValue;
        })();

        const nameB = (() => {
          const fieldValue = b[String(sortField).toUpperCase()];
          if (typeof fieldValue === 'string') {
            return fieldValue?.toLowerCase() || '';
          }
          return fieldValue;
        })();

        if (dataType === 'string') {
          return String(sortMode).toUpperCase() === 'ASC'
            ? nameA?.localeCompare(nameB)
            : nameB?.localeCompare(nameA);
        }

        if (dataType === 'number') {
          return String(sortMode).toUpperCase() === 'ASC'
            ? nameA - nameB
            : nameB - nameA;
        }

        const dateObject = new Date(nameA);
        if (!isNaN(dateObject?.getTime())) {
          return String(sortMode).toUpperCase() === 'ASC'
            ? nameA?.getTime() - nameB?.getTime()
            : nameB?.getTime() - nameA?.getTime();
        }

        return String(sortMode).toUpperCase() === 'ASC'
          ? nameA?.localeCompare(nameB)
          : nameB?.localeCompare(nameA);
      });

    const contractsWitPagination = contracts.slice(fromRecord, toRecord);
    const rowCount = contracts.length;

    return {
      contracts: contractsWitPagination,
      rowCount
    };
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const getDetailByContract = async (
  sessionID: string,
  contractType: number,
  filter: { [key: string]: any }
) => {
  const { contractId } = filter;
  try {
    const contractDetails = await contractDetailRepository.find(
      sessionID,
      {
        contractType,
        masterkey: contractId
      });

    return contractDetails;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const cacheData = async (sessionID: string) => {
  try {
    const settings = await systemSettingsRepository.findOne(sessionID);

    const contractType = settings.CONTRACTTYPE ?? ContractType.GS;

    const response = await contractsRepository.find(
      sessionID,
      {
        contractType
      });

    return response;
  } catch (error) {
    throw error;
  }
};

export const contractsService = {
  findAll,
  getDetailByContract,
  cacheData
};
