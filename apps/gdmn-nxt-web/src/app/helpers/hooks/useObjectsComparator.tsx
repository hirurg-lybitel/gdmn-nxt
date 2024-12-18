const useObjectsComparator = () => {
  function compareObjects(obj1: object, obj2: object): boolean {
    const sortedStringifiedObj1 = JSON.stringify(obj1, Object.keys(obj1).sort());
    const sortedStringifiedObj2 = JSON.stringify(obj2, Object.keys(obj2).sort());

    return sortedStringifiedObj1 === sortedStringifiedObj2;
  }
  return compareObjects;
};

export default useObjectsComparator;
