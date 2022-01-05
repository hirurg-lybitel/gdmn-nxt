import { render } from '@testing-library/react';

import WrapperBelgiss from './wrapper-belgiss';

describe('WrapperBelgiss', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WrapperBelgiss />);
    expect(baseElement).toBeTruthy();
  });
});
