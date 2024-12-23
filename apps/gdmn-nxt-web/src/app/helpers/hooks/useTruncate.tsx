const useTruncate = () => {
  return (sourceString: string, length: number) =>
    (sourceString.length > length)
      ? sourceString.slice(0, length - 1) + ' ...'
      : sourceString;
};

export default useTruncate;
