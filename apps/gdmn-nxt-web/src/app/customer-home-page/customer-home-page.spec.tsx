import { render } from '@testing-library/react';

import CustomerHomePage from './customer-home-page';

describe('CustomerHomePage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CustomerHomePage />);
    expect(baseElement).toBeTruthy();
  });
});
