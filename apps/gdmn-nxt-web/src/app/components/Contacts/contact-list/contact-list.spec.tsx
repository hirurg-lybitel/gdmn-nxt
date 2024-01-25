import { render } from '@testing-library/react';

import ContactList from './contact-list';

describe('ContactList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ContactList />);
    expect(baseElement).toBeTruthy();
  });
});
