import { InternalServerErrorException, ITimeTrackProject, ITimeTrackTask, NotFoundException } from '@gsbelarus/util-api-types';
import { timeTrackerProjectsRepository } from '../repository';
import { timeTrackerTasksService } from '@gdmn-nxt/modules/time-tracker-tasks/service';
import { favoriteTimeTrackerProjectsRepository } from '../repository/favoriteTimeTrackerProjects';
import { timeTrackingService } from '@gdmn-nxt/modules/time-tracker/service';
import { ERROR_MESSAGES } from '@gdmn/constants/server';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  /** Sorting */
  const sortField = filter?.field ?? 'NAME';
  const sortMode = filter?.sort ?? 'ASC';
  /** Filtering */
  const userId = filter.userId;
  const customerId = filter.customerId;
  const groupByFavorite = filter.groupByFavorite === 'true';
  const projectType = filter.projectType;
  const name = filter.name;
  const type = filter.type;
  const customer = filter.customer;

  try {
    const projects = await timeTrackerProjectsRepository.find(
      sessionID,
      {
        ...(customerId && { 'USR$CUSTOMER': customerId }),
        ...(projectType && { 'USR$PROJECT_TYPE': projectType }),
        ...(customer && { 'USR$CUSTOMER': customer })
      });

    const favorites = await favoriteTimeTrackerProjectsRepository.find(sessionID, { 'USR$USER': userId });

    const tasks = new Map<number, ITimeTrackTask[]>();

    (await timeTrackerTasksService.findAll(sessionID, { userId }))
      ?.forEach(({ project, ...task }) => {
        const projectId = project.ID;
        if (tasks.has(projectId)) {
          if (tasks.get(projectId)?.findIndex(({ ID }) => ID === task.ID) < 0) {
            tasks.get(projectId)?.push(task);
          }
        } else {
          tasks.set(projectId, [task]);
        };
      });

    const sortedProjects = projects
      .reduce<ITimeTrackProject[]>((filteredArray, project) => {
        let checkConditions = true;

        let newProject: ITimeTrackProject;

        const checkType = () => {
          if (type === '1') {
            return !project.isDone;
          }
          if (type === '2') {
            return project.isDone;
          }
          return true;
        };

        if (type) {
          checkConditions = checkConditions && checkType();
        }

        if (groupByFavorite) {
          /** Split projects into favorite and non-favorite */
          const projectTasks = tasks.get(project.ID) ?? [];

          const favoriteTasks = projectTasks.filter(({ isFavorite }) => isFavorite);
          const nonFavoriteTasks = projectTasks.filter(({ isFavorite }) => !isFavorite);

          if (favoriteTasks.length > 0) {
            newProject = {
              ...project,
              isFavorite: true,
              tasks: favoriteTasks
            };
          }

          if (nonFavoriteTasks.length > 0) {
            newProject = {
              ...project,
              isFavorite: false,
              tasks: nonFavoriteTasks
            };
          }
          ;
        } else {
          const projectTasks = tasks.get(project.ID) ?? [];
          for (const task of projectTasks) {
            if (task.isFavorite) newProject = { ...project, isFavorite: true, tasks: projectTasks };
          }
          if (!newProject) {
            newProject = { ...project, isFavorite: false, tasks: projectTasks };
          }
        }

        if (name) {
          const lowerName = String(name).toLowerCase();
          checkConditions = checkConditions && (
            newProject.name?.toLowerCase().includes(lowerName) ||
            newProject.tasks.findIndex(task => task.name.toLowerCase().includes(lowerName)) !== -1
          );
        }

        if (checkConditions) {
          filteredArray.push({
            ...newProject
          });
        }
        return filteredArray;
      }, [])
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

    return sortedProjects;
  } catch (error) {
    throw error;
  }
};

const addToFavorites = async (
  sessionID: string,
  userId: number,
  taskId: number
) => {
  try {
    const workProject = await timeTrackerProjectsRepository.findOne(sessionID, { id: taskId });
    if (!workProject) {
      throw NotFoundException(`Не найдена запись с id=${taskId}`);
    }

    const newFavorite = await favoriteTimeTrackerProjectsRepository.save(
      sessionID,
      userId,
      taskId);

    return await favoriteTimeTrackerProjectsRepository.find(
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
  taskId: number
) => {
  try {
    const favorite = await favoriteTimeTrackerProjectsRepository.find(
      sessionID, {
        'USR$USER': userId,
        id: taskId
      });
    if (!favorite) {
      throw NotFoundException(`Не найден проект с id=${taskId}`);
    }

    const isDeleted = await favoriteTimeTrackerProjectsRepository.remove(
      sessionID,
      userId,
      taskId);

    if (!isDeleted) {
      throw InternalServerErrorException('Ошибка при удалении проекта из избранных');
    }

    return isDeleted;
  } catch (error) {
    throw error;
  }
};

const getFilters = async (
  sessionID: string
) => {
  try {
    const filters = await favoriteTimeTrackerProjectsRepository.getFilters(sessionID);
    return filters;
  } catch (error) {
    throw error;
  }
};

const statistics = async (
  sessionID: string,
  projectId: number
) => {
  try {
    const tasks = await timeTrackerTasksService.findAll(sessionID, { projectId });

    const responce = Promise.all(tasks.map(async task => ({ ...task, timeTrack: await timeTrackingService.findAll(sessionID, { taskId: task.ID }) })));
    return responce;
  } catch (error) {
    throw error;
  }
};

const create = async (
  sessionID: string,
  body: ITimeTrackProject
) => {
  try {
    return await timeTrackerProjectsRepository.save(sessionID, body);
  } catch (error) {
    throw error;
  }
};

const update = async (
  sessionID: string,
  id: number,
  body: Partial<ITimeTrackProject>
) => {
  try {
    const project = await timeTrackerProjectsRepository.findOne(sessionID, { id });
    if (!project) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND_WITH_ID(id));
    }
    const updatedProject =
        await timeTrackerProjectsRepository.update(
          sessionID,
          id,
          body,
        );
    if (!updatedProject) {
      throw InternalServerErrorException(ERROR_MESSAGES.UPDATE_FAILED);
    }

    return await timeTrackerProjectsRepository.findOne(sessionID, { id });
  } catch (error) {
    throw error;
  }
};

const remove = async (
  sessionID: string,
  id: number
) => {
  try {
    const project = await timeTrackerProjectsRepository.findOne(sessionID, { id });
    if (!project) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND_WITH_ID(id));
    }
    const isDeleted = await timeTrackerProjectsRepository.remove(sessionID, id);

    if (!isDeleted) {
      throw InternalServerErrorException(ERROR_MESSAGES.DELETE_FAILED);
    }

    return isDeleted;
  } catch (error) {
    throw error;
  }
};


export const timeTrackerProjectsService = {
  findAll,
  addToFavorites,
  removeFromFavorites,
  getFilters,
  statistics,
  create,
  update,
  remove
};
