import { render } from '@testing-library/react';

import ChartColumn from './chart-column';

describe('ChartColumn', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ChartColumn />);
    expect(baseElement).toBeTruthy();
  });
});
