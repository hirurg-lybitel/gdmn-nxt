import { render } from '@testing-library/react';

import AccountSettings from './account-settings';

describe('AccountSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AccountSettings />);
    expect(baseElement).toBeTruthy();
  });
});
