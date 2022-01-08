import { render } from '@testing-library/react';

import ReportParams from './report-params';

describe('ReportParams', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReportParams open={false} onCancelClick={function (): void {
      throw new Error('Function not implemented.');
    } } onSaveClick={function (): void {
      throw new Error('Function not implemented.');
    } } />);
    expect(baseElement).toBeTruthy();
  });
});
