import { InternalServerErrorException, ITimeTrackProject, ITimeTrackTask, NotFoundException } from '@gsbelarus/util-api-types';
import { timeTrackerProjectsRepository } from '../repository';
import { timeTrackerTasksService } from '@gdmn-nxt/modules/time-tracker-tasks/service';
import { favoriteTimeTrackerProjectsRepository } from '../repository/favoriteTimeTrackerProjects';
import { timeTrackingService } from '@gdmn-nxt/modules/time-tracker/service';
import { ERROR_MESSAGES } from '@gdmn/constants/server';
import dayjs from '@gdmn-nxt/dayjs';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  /** Sorting */
  const sortField = filter?.field ?? 'NAME';
  const sortMode = filter?.sort ?? 'ASC';
  /** Filtering */
  const userId = filter?.userId;
  const customerId = filter?.customerId;
  const groupByFavorite = filter?.groupByFavorite === 'true';
  const projectType = filter?.projectType;
  const name = filter?.name;
  const customers = filter?.customers;
  const taskisActive = filter?.taskisActive;
  const status = filter?.status;

  try {
    const projects = await timeTrackerProjectsRepository.find(
      sessionID,
      {
        ...(customerId && { 'USR$CUSTOMER': customerId }),
        ...(projectType && { 'USR$PROJECT_TYPE': projectType }),
        ...(status && status !== 'all' && { 'USR$DONE': status === 'active' ? 0 : 1 })
      });

    const favorites = await favoriteTimeTrackerProjectsRepository.find(sessionID, { 'USR$USER': userId });

    const tasks = new Map<number, ITimeTrackTask[]>();

    (await timeTrackerTasksService.findAll(sessionID, { userId, isActive: taskisActive }))
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

        if (name) {
          const lowerName = String(name).toLowerCase();
          checkConditions = checkConditions && (
            project.name?.toLowerCase().includes(lowerName) ||
            (tasks.get(project.ID) && tasks.get(project.ID)?.findIndex(task => task.name.toLowerCase().includes(lowerName)) !== -1) ||
            project.customer.NAME.toLowerCase().includes(lowerName)
          );
        }

        if (customers) {
          checkConditions = checkConditions && (customers.split(',').findIndex(cus => cus === project.customer.ID.toString()) !== -1);
        }

        if (checkConditions) {
          if (groupByFavorite) {
            /** Split projects into favorite and non-favorite */
            const projectTasks = tasks.get(project.ID) ?? [];

            const favoriteTasks = projectTasks.filter(({ isFavorite }) => isFavorite);
            const nonFavoriteTasks = projectTasks.filter(({ isFavorite }) => !isFavorite);

            if (favoriteTasks.length > 0) {
              filteredArray.push({
                ...project,
                isFavorite: true,
                tasks: favoriteTasks
              });
            }

            if (nonFavoriteTasks.length > 0) {
              filteredArray.push({
                ...project,
                isFavorite: false,
                tasks: nonFavoriteTasks
              });
            }
          } else {
            const projectTasks = tasks.get(project.ID) ?? [];
            let newProject;
            for (const task of projectTasks) {
              if (task.isFavorite) newProject = { ...project, isFavorite: true, tasks: projectTasks };
            }
            if (!newProject) {
              newProject = { ...project, isFavorite: false, tasks: projectTasks };
            }
            filteredArray.push({
              ...newProject
            });
          }
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

const statistics = async (
  sessionID: string,
  projectId: number,
  filter?: { [key: string]: any }
) => {
  try {
    const timeTrackings = await timeTrackingService.findAll(sessionID, {
      projectId,
      ...filter
    });

    /** Группируем записи по задачам */
    const taskGroups = timeTrackings.reduce((groups, track) => {
      const taskId = track.task.ID;
      if (!groups[taskId]) {
        groups[taskId] = {
          id: taskId,
          name: track.task.name,
          tracks: []
        };
      }
      groups[taskId].tracks.push(track);
      return groups;
    }, {} as { [key: number]: { id: number; name: string; tracks: typeof timeTrackings } });

    /** Вычисляем статистику для каждой задачи */
    const response = Object.values(taskGroups).map(({ id, name, tracks }) => {
      const durations = tracks.reduce((acc, track) => {
        const duration = track.duration ?? 'PT0M';
        if (track.billable) {
          acc.billableDuration = dayjs
            .duration(acc.billableDuration ?? 'PT0M')
            .add(dayjs.duration(duration))
            .toISOString();
        } else {
          acc.nonBillableDuration = dayjs
            .duration(acc.nonBillableDuration ?? 'PT0M')
            .add(dayjs.duration(duration))
            .toISOString();
        }
        return acc;
      }, {
        billableDuration: 'PT0M',
        nonBillableDuration: 'PT0M'
      });

      const totalDuration = tracks.reduce((total, track) => {
        return dayjs
          .duration(total)
          .add(dayjs.duration(track.duration || 'PT0M'))
          .toISOString();
      }, 'PT0M');

      return {
        id,
        name,
        billableDuration: durations.billableDuration,
        nonBillableDuration: durations.nonBillableDuration,
        totalDuration
      };
    });

    return response;
  } catch (error) {
    throw error;
  }
};

const create = async (
  sessionID: string,
  userId: number,
  body: ITimeTrackProject
) => {
  try {
    const project = await timeTrackerProjectsRepository.save(sessionID, body);
    const favorites = Promise.all(project.tasks.map(async task => {
      if (task.isFavorite) {
        return await timeTrackerTasksService.addToFavorites(sessionID, userId, task.ID);
      }
    }));
    return project;
  } catch (error) {
    throw error;
  }
};

const update = async (
  sessionID: string,
  userId: number,
  id: number,
  body: Partial<ITimeTrackProject>
) => {
  try {
    const project = await timeTrackerProjectsRepository.findOne(sessionID, { id });
    if (!project) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND_WITH_ID(id));
    }
    const updatedProject = await timeTrackerProjectsRepository.update(
      sessionID,
      userId,
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
  statistics,
  create,
  update,
  remove
};
