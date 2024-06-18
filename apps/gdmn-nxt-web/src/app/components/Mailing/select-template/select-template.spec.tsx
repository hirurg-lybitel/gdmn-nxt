import { render } from '@testing-library/react';

import SelectTemplate from './select-template';

describe('SelectTemplate', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SelectTemplate />);
    expect(baseElement).toBeTruthy();
  });
});
