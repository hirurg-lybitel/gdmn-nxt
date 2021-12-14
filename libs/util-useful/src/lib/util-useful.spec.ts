import { genRandomPassword } from '..';
import { utilUseful } from './util-useful';

describe('utilUseful', () => {
  it('should work', () => {
    expect(utilUseful()).toEqual('util-useful');

    expect(genRandomPassword(10).length).toEqual(10);
  });
});
