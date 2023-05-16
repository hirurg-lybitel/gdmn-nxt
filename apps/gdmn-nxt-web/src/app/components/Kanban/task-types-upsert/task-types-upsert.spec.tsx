import { render } from '@testing-library/react';

import TaskTypesUpsert from './task-types-upsert';

describe('TaskTypesUpsert', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TaskTypesUpsert />);
    expect(baseElement).toBeTruthy();
  });
});
