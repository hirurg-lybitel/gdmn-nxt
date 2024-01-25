import { render } from '@testing-library/react';

import ContactCards from './contact-cards';

describe('ContactCards', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ContactCards />);
    expect(baseElement).toBeTruthy();
  });
});
