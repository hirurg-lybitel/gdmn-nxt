import { render } from '@testing-library/react';

import KanbanCard from './kanban-card';

describe('KanbanCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<KanbanCard />);
    expect(baseElement).toBeTruthy();
  });
});
