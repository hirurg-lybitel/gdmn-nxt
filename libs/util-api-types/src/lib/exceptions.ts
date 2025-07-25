type Exception = {
  code: number,
  message?: string;
};
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

export const UnprocessableEntityException = (message = ''): Exception => ({
  code: 422,
  message
});

export const ForbiddenException = (message = ''): Exception => ({
  code: 403,
  message
});
