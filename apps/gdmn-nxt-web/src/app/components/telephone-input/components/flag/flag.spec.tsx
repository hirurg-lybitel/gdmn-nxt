import { render } from '@testing-library/react';

import Flag from './flag';

describe('Flag', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Flag />);
    expect(baseElement).toBeTruthy();
  });
});
