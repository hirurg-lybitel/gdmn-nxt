import { render } from '@testing-library/react';

import MainCard from './main-card';

describe('MainCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MainCard />);
    expect(baseElement).toBeTruthy();
  });
});
