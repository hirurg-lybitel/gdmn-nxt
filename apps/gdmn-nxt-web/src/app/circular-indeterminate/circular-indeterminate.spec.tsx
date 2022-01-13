import { render } from '@testing-library/react';

import CircularIndeterminate from './circular-indeterminate';

describe('CircularIndeterminate', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CircularIndeterminate />);
    expect(baseElement).toBeTruthy();
  });
});
