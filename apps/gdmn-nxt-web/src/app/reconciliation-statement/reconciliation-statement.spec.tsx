import { render } from '@testing-library/react';

import ReconciliationStatement from './reconciliation-statement';

describe('ReconciliationStatement', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReconciliationStatement />);
    expect(baseElement).toBeTruthy();
  });
});
