import { render } from '@testing-library/react';

import SqlEditor from './sql-editor';

describe('SqlEditor', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SqlEditor />);
    expect(baseElement).toBeTruthy();
  });
});
