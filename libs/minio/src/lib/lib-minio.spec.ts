import { libMinio } from './lib-minio';

describe('libMinio', () => {
  it('should work', () => {
    expect(libMinio()).toEqual('lib-minio');
  });
});
