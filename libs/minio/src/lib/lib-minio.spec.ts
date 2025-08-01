import { libMinio } from './lib-minio';

describe('libMinio', () => {
  it('should return the correct value', () => {
    expect(libMinio()).toEqual('lib-minio');
  });
});
