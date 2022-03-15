import { render } from '@testing-library/react';

import NotificationList from './notification-list';

describe('NotificationList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NotificationList />);
    expect(baseElement).toBeTruthy();
  });
});
