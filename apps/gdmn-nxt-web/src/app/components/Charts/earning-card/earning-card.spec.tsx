import { render } from '@testing-library/react';

import EarningCard from './earning-card';

describe('EarningCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EarningCard />);
    expect(baseElement).toBeTruthy();
  });
});
