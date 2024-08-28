import { InternalServerErrorException, IWorkProject, NotFoundException } from '@gsbelarus/util-api-types';
import { workProjectsRepository } from '../repository';

type WorkProjectDto = Omit<IWorkProject, 'ID'>;

const findAll = async (
  sessionID: string
) => {
  try {
    return await workProjectsRepository.find(sessionID, {
      'USR$STATUS': 0
    });
  } catch (error) {
    throw error;
  }
};

const create = async (
  sessionID: string,
  body: WorkProjectDto
) => {
  try {
    return await workProjectsRepository.save(sessionID, body);
  } catch (error) {
    throw error;
  }
};

const update = async (
  sessionID: string,
  id: number,
  body: Partial<WorkProjectDto>
) => {
  try {
    const feedback = await workProjectsRepository.findOne(sessionID, { id });
    if (!feedback) {
      throw NotFoundException(`Не найдена запись с id=${id}`);
    }
    const updatedFeedback =
        await workProjectsRepository.update(
          sessionID,
          id,
          body,
        );
    if (!updatedFeedback) {
      throw InternalServerErrorException('Ошибка при обновлении рабочего проекта');
    }

    return await workProjectsRepository.findOne(sessionID, { id });
  } catch (error) {
    throw error;
  }
};

const remove = async (
  sessionID: string,
  id: number
) => {
  try {
    const workProject = await workProjectsRepository.findOne(sessionID, { id });
    if (!workProject) {
      throw NotFoundException(`Не найдена запись с id=${id}`);
    }
    const isDeleted = await workProjectsRepository.remove(sessionID, id);

    if (!isDeleted) {
      throw InternalServerErrorException('Ошибка при удалении рабочего проекта');
    }

    return isDeleted;
  } catch (error) {
    throw error;
  }
};

export const workProjectsService = {
  create,
  update,
  remove,
  findAll
};
