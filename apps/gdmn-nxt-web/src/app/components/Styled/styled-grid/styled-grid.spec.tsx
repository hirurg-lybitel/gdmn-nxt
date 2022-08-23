import { render } from '@testing-library/react';

import StyledGrid from './styled-grid';

describe('StyledGrid', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StyledGrid />);
    expect(baseElement).toBeTruthy();
  });
});
