import { render } from '@testing-library/react';

import Deals from './deals';

describe('Deals', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Deals />);
    expect(baseElement).toBeTruthy();
  });
});
