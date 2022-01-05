import { render } from '@testing-library/react';

import PageHeader from './page-header';

describe('PageHeader', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageHeader children={null} userType={''} />);
    expect(baseElement).toBeTruthy();
  });
});