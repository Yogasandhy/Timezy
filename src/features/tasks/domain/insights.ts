import { getLocalDateKey, parseLocalDateKey, shiftDateKey, Task } from './task';
import { sortTasks } from './selectors';

export type InsightDay = {
  date: string;
  label: string;
  total: number;
  completed: number;
};

export type InsightCategory = {
  name: string;
  total: number;
  completed: number;
};

export type WeeklyInsights = {
  startDate: string;
  endDate: string;
  total: number;
  completed: number;
  remaining: number;
  progress: number;
  overdue: number;
  highPriorityOpen: number;
  overdueTasks: Task[];
  days: InsightDay[];
  categories: InsightCategory[];
  nextTasks: Task[];
};

/** Summarizes the current Monday–Sunday plan using local calendar dates. */
export function getWeeklyInsights(
  tasks: Task[],
  today: string = getLocalDateKey(),
): WeeklyInsights {
  const todayDate = parseLocalDateKey(today);
  const mondayOffset = (todayDate.getDay() + 6) % 7;
  const startDate = shiftDateKey(today, -mondayOffset);
  const endDate = shiftDateKey(startDate, 6);
  const weekTasks = tasks.filter(
    task => task.dueDate >= startDate && task.dueDate <= endDate,
  );
  const completed = weekTasks.filter(task => task.completedAt !== null).length;
  const remaining = weekTasks.length - completed;

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = shiftDateKey(startDate, index);
    const dayTasks = weekTasks.filter(task => task.dueDate === date);
    return {
      date,
      label: parseLocalDateKey(date)
        .toLocaleDateString('en-US', { weekday: 'short' })
        .slice(0, 1),
      total: dayTasks.length,
      completed: dayTasks.filter(task => task.completedAt !== null).length,
    };
  });

  const categoryCounts = new Map<string, InsightCategory>();
  for (const task of weekTasks) {
    const name = task.category.trim() || 'Uncategorized';
    const category = categoryCounts.get(name) ?? {
      name,
      total: 0,
      completed: 0,
    };
    category.total += 1;
    if (task.completedAt !== null) category.completed += 1;
    categoryCounts.set(name, category);
  }

  const todayOpen = tasks.filter(task => task.completedAt === null);
  const overdueTasks = todayOpen
    .filter(task => task.dueDate < today)
    .sort((left, right) => right.dueDate.localeCompare(left.dueDate))
    .slice(0, 3);
  const nextTasks = sortTasks(
    todayOpen.filter(task => task.dueDate >= today),
  ).slice(0, 3);

  return {
    startDate,
    endDate,
    total: weekTasks.length,
    completed,
    remaining,
    progress:
      weekTasks.length === 0
        ? 0
        : Math.round((completed / weekTasks.length) * 100),
    overdue: todayOpen.filter(task => task.dueDate < today).length,
    highPriorityOpen: todayOpen.filter(task => task.priority === 'high').length,
    overdueTasks,
    days,
    categories: [...categoryCounts.values()].sort(
      (left, right) =>
        right.total - left.total || left.name.localeCompare(right.name),
    ),
    nextTasks,
  };
}
