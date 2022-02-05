import { render } from '@testing-library/react';

import ContactGroupEditForm from './contact-group-edit';

describe('ContactGroupEditForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ContactGroupEditForm />);
    expect(baseElement).toBeTruthy();
  });
});
