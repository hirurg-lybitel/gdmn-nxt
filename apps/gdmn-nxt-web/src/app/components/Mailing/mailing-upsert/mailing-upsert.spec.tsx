import { render } from '@testing-library/react';

import MailingUpsert from './mailing-upsert';

describe('MailingUpsert', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MailingUpsert />);
    expect(baseElement).toBeTruthy();
  });
});
