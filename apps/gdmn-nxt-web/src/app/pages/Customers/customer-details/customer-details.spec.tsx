import { render } from '@testing-library/react';

import CustomerDetails from './customer-details';

describe('CustomerDetails', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CustomerDetails />);
    expect(baseElement).toBeTruthy();
  });
});
