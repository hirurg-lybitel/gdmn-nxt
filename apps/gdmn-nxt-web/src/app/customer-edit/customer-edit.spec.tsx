import { render } from '@testing-library/react';

import CustomerEdit from './customer-edit';

describe('CustomerEdit', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CustomerEdit />);
    expect(baseElement).toBeTruthy();
  });
});
