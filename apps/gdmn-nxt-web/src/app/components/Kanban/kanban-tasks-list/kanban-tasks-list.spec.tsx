import { render } from '@testing-library/react';

import KanbanTasksList from './kanban-tasks-list';

describe('KanbanTasksList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<KanbanTasksList />);
    expect(baseElement).toBeTruthy();
  });
});
