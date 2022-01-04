import { render } from '@testing-library/react';

import SelectMode from './select-mode';

describe('SelectMode', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SelectMode />);
    expect(baseElement).toBeTruthy();
  });
});
