import { render } from '@testing-library/react';

import KanbanTasksCard from './kanban-tasks-card';

describe('KanbanTasksCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<KanbanTasksCard />);
    expect(baseElement).toBeTruthy();
  });
});
