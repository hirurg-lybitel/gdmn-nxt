interface IResultError {
  errorMessage: string
}
export const resultError = (message: string):IResultError => {
  return {errorMessage: message};
}
