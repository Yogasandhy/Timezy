import { Task } from './task';
import { getCompletionSummary, selectTasks, sortTasks } from './selectors';

const tasks: Task[] = [
  {
    id: 'later', title: 'Later', notes: '', dueDate: '2026-10-16', dueTime: '12:00',
    priority: 'normal', category: '', createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z', completedAt: null,
  },
  {
    id: 'anytime', title: 'Anytime', notes: '', dueDate: '2026-10-16', dueTime: null,
    priority: 'high', category: '', createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z', completedAt: null,
  },
  {
    id: 'done', title: 'Done', notes: '', dueDate: '2026-10-16', dueTime: '09:00',
    priority: 'low', category: '', createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z', completedAt: '2026-10-16T08:00:00.000Z',
  },
  {
    id: 'tomorrow', title: 'Tomorrow', notes: '', dueDate: '2026-10-17', dueTime: null,
    priority: 'high', category: '', createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z', completedAt: null,
  },
];

describe('task selectors', () => {
  it('sorts by date, then scheduled time, with anytime tasks last', () => {
    expect(sortTasks(tasks).map(task => task.id)).toEqual(['done', 'later', 'anytime', 'tomorrow']);
  });

  it('filters by selected day, completion, and priority', () => {
    expect(selectTasks(tasks, { date: '2026-10-16', status: 'open' }).map(task => task.id)).toEqual([
      'later', 'anytime',
    ]);
    expect(selectTasks(tasks, { date: '2026-10-16', status: 'done', priority: 'low' }).map(task => task.id)).toEqual([
      'done',
    ]);
  });

  it('summarizes only the selected local date and keeps empty progress at zero', () => {
    expect(getCompletionSummary(tasks, '2026-10-16')).toEqual({ total: 3, completed: 1, remaining: 2, progress: 33 });
    expect(getCompletionSummary([], '2026-10-16')).toEqual({ total: 0, completed: 0, remaining: 0, progress: 0 });
  });
});
