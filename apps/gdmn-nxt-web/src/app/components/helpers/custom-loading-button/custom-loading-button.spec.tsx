import { render } from '@testing-library/react';

import CustomLoadingButton from './custom-loading-button';

describe('CustomLoadingButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CustomLoadingButton />);
    expect(baseElement).toBeTruthy();
  });
});
