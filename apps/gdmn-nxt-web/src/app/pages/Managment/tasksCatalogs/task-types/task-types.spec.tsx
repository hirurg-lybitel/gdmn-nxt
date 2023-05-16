import { render } from '@testing-library/react';

import TaskTypes from './task-types';

describe('TaskTypes', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TaskTypes />);
    expect(baseElement).toBeTruthy();
  });
});
