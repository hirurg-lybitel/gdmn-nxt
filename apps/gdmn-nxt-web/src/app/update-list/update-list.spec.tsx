import { render } from '@testing-library/react';

import UpdateList from './update-list';

describe('UpdateList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UpdateList />);
    expect(baseElement).toBeTruthy();
  });
});
