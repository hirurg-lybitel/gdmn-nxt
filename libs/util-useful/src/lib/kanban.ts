import { IKanbanTask } from '@gsbelarus/util-api-types';

const getDayDiff = ((startDate: Date, endDate: Date) => {
  const msInDay = 24 * 60 * 60 * 1000;

  return Math.round(
    (startDate?.getTime() - endDate?.getTime()) / msInDay,
  );
});

export const getTaskStage = (task: Partial<IKanbanTask>) => {
  if (task.USR$CLOSED) return 5;
  if (!task.USR$DEADLINE) return 4;

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const deadline = new Date(task.USR$DEADLINE);
  deadline.setHours(0, 0, 0, 0);

  const daysInmonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const diffTime = getDayDiff(deadline, currentDate);

  switch (true) {
    case diffTime < 0:
      return 0;
    case diffTime === 0:
      return 1;
    case diffTime === 1:
      return 2;
    case diffTime <= daysInmonth - currentDate.getDate():
      return 3;
    default:
      return 4;
  };
};
