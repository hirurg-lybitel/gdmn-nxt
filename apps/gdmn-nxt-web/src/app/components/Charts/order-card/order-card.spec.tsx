import { render } from '@testing-library/react';

import OrderCard from './order-card';

describe('OrderCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OrderCard />);
    expect(baseElement).toBeTruthy();
  });
});
