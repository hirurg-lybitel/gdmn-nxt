import { InternalServerErrorException, IWorkProject, NotFoundException } from '@gsbelarus/util-api-types';
import { workProjectsRepository } from '../repository';
import { favoriteWorkProjectRepository } from '../repository/favoriteWorkProjects';

type WorkProjectDto = Omit<IWorkProject, 'ID'>;

const findAll = async (
  sessionID: string,
  userId: number
) => {
  try {
    const sortField = 'NAME';
    const sortMode = 'ASC';

    const workProjects = await workProjectsRepository.find(sessionID, {
      'USR$STATUS': 0
    });

    const favorites = await favoriteWorkProjectRepository.find(sessionID, { 'USR$USER': userId });

    return workProjects
      .map(w => ({ ...w, isFavorite: favorites.findIndex(f => f.workProject.ID === w.ID) >= 0 }))
      .sort((a, b) => {
        const nameA = a[String(sortField).toUpperCase()]?.toLowerCase() || '';
        const nameB = b[String(sortField).toUpperCase()]?.toLowerCase() || '';
        if (a.isFavorite === b.isFavorite) {
          return String(sortMode).toUpperCase() === 'ASC'
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        }
        return a.isFavorite ? -1 : 1;
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

const addToFavorites = async (
  sessionID: string,
  userId: number,
  workProjectId: number
) => {
  try {
    const workProject = await workProjectsRepository.findOne(sessionID, { id: workProjectId });
    if (!workProject) {
      throw NotFoundException(`Не найдена запись с id=${workProjectId}`);
    }

    const newFavorite = await favoriteWorkProjectRepository.save(
      sessionID,
      userId,
      workProjectId);

    return await favoriteWorkProjectRepository.find(
      sessionID,
      {
        id: newFavorite.ID
      });
  } catch (error) {
    throw error;
  }
};

const removeFromFavorites = async (
  sessionID: string,
  userId: number,
  workProjectId: number
) => {
  try {
    const favorite = await favoriteWorkProjectRepository.find(
      sessionID, {
        'USR$USER': userId,
        id: workProjectId
      });
    if (!favorite) {
      throw NotFoundException(`Не найдена рабочий проект с id=${workProjectId}`);
    }

    const isDeleted = await favoriteWorkProjectRepository.remove(
      sessionID,
      userId,
      workProjectId);

    if (!isDeleted) {
      throw InternalServerErrorException('Ошибка при удалении рабочего проекта из избранных');
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
  findAll,
  addToFavorites,
  removeFromFavorites
};
