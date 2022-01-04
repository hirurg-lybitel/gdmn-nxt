import { render } from '@testing-library/react';

import LoggedUser from './logged-user';

describe('LoggedUser', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LoggedUser />);
    expect(baseElement).toBeTruthy();
  });
});
