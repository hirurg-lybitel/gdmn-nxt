export const forEachAsync = async <T = any>(
  array: T[],
  asyncCallback: (element: T, index: number, array: T[]) => Promise<any>,
  errorHandler: ((error: any, element: T) => any) | null = null
) => {
  const results = [];

  for (let index = 0; index < array.length; index++) {
    if (typeof errorHandler === 'function') {
      try {
        const result = await asyncCallback(array[index], index, array);
        results.push(result);
      } catch (e) {
        const errorResult = errorHandler(e, array[index]);
        results.push(errorResult);
      }
    } else {
      const result = await asyncCallback(array[index], index, array);
      results.push(result);
    }
  }

  return results;
};
