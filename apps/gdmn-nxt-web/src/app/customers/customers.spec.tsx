import { render } from '@testing-library/react';

import Customers from './customers';

describe('Customers', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Customers />);
    expect(baseElement).toBeTruthy();
  });
});
