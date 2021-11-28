import { render } from '@testing-library/react';

import CommonUiDialogs from './common-ui-dialogs';

describe('CommonUiDialogs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CommonUiDialogs />);
    expect(baseElement).toBeTruthy();
  });
});
