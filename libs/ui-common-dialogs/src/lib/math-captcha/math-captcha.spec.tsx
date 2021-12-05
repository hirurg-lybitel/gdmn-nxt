import { render } from '@testing-library/react';

import MathCaptcha from './math-captcha';

describe('MathCaptcha', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MathCaptcha />);
    expect(baseElement).toBeTruthy();
  });
});
