type Exception = {
  code: number,
  message?: string;
}
export const NotFoundException = (message = ''): Exception => ({
  code: 404,
  message
});

export const NoContentException = (message = ''): Exception => ({
  code: 204,
  message
});

export const InternalServerErrorException = (message = ''): Exception => ({
  code: 500,
  message
});
