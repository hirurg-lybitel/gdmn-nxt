import { render } from '@testing-library/react';

import ConfirmDialog from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ConfirmDialog />);
    expect(baseElement).toBeTruthy();
  });
});
