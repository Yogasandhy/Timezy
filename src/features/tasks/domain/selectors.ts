import { Task, TaskPriority } from './task';

export type TaskStatusFilter = 'all' | 'open' | 'done';

export type TaskFilters = {
  date?: string;
  status?: TaskStatusFilter;
  priority?: TaskPriority;
};

export type CompletionSummary = {
  total: number;
  completed: number;
  remaining: number;
  progress: number;
};

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((left, right) => {
    const dateOrder = left.dueDate.localeCompare(right.dueDate);
    if (dateOrder !== 0) return dateOrder;
    const leftTime = left.dueTime ?? '99:99';
    const rightTime = right.dueTime ?? '99:99';
    const timeOrder = leftTime.localeCompare(rightTime);
    if (timeOrder !== 0) return timeOrder;
    return left.createdAt.localeCompare(right.createdAt) || left.title.localeCompare(right.title);
  });
}

export function selectTasks(tasks: Task[], filters: TaskFilters = {}): Task[] {
  const filtered = tasks.filter(task => {
    if (filters.date && task.dueDate !== filters.date) return false;
    if (filters.status === 'open' && task.completedAt !== null) return false;
    if (filters.status === 'done' && task.completedAt === null) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    return true;
  });
  return sortTasks(filtered);
}

export function getCompletionSummary(tasks: Task[], date: string): CompletionSummary {
  const dayTasks = tasks.filter(task => task.dueDate === date);
  const completed = dayTasks.filter(task => task.completedAt !== null).length;
  const total = dayTasks.length;
  return {
    total,
    completed,
    remaining: total - completed,
    progress: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}
