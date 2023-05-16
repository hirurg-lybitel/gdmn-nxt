export function utilHelpers(): string {
  return 'util-helpers';
}

export const getDayDiff = ((startDate: Date, endDate: Date) => {
  const msInDay = 24 * 60 * 60 * 1000;

  return Math.round(
    (startDate?.getTime() - endDate?.getTime()) / msInDay,
  );
});
