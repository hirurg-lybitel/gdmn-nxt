import { render } from '@testing-library/react';

import MainToolbar from './main-toolbar';

describe('MainToolbar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MainToolbar />);
    expect(baseElement).toBeTruthy();
  });
});
