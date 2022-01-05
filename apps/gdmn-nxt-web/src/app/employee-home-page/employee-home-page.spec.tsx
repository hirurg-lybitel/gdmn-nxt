import { render } from '@testing-library/react';

import EmployeeHomePage from './employee-home-page';

describe('EmployeeHomePage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EmployeeHomePage />);
    expect(baseElement).toBeTruthy();
  });
});
