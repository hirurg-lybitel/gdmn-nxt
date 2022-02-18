import { render } from '@testing-library/react';

import CustomizedDialog from './customized-dialog';

describe('CustomizedDialog', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CustomizedDialog />);
    expect(baseElement).toBeTruthy();
  });
});
