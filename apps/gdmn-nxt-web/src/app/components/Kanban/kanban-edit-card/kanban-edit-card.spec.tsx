import { render } from '@testing-library/react';

import KanbanEditCard from './kanban-edit-card';

describe('KanbanEditCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<KanbanEditCard />);
    expect(baseElement).toBeTruthy();
  });
});
