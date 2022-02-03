import { render } from '@testing-library/react';

import GoodGroupEditForm from './good-group-edit';

describe('GoodGroupEditForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GoodGroupEditForm />);
    expect(baseElement).toBeTruthy();
  });
});
