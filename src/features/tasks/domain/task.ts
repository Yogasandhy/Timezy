export type TaskPriority = 'low' | 'normal' | 'high';

export type Task = {
  id: string;
  title: string;
  notes: string;
  dueDate: string;
  dueTime: string | null;
  priority: TaskPriority;
  category: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type TaskDraft = {
  title: string;
  notes?: string;
  dueDate: string;
  dueTime?: string | null;
  priority?: TaskPriority;
  category?: string;
};

export type TaskDraftErrors = Partial<Record<'title' | 'dueDate' | 'dueTime', string>>;

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

export function normalizeTaskTitle(title: string): string {
  return title.trim();
}

export function validateTaskDraft(draft: TaskDraft): TaskDraftErrors {
  const errors: TaskDraftErrors = {};
  if (!normalizeTaskTitle(draft.title)) errors.title = 'Add a task title to continue.';
  if (!isDateKey(draft.dueDate)) errors.dueDate = 'Choose a valid date.';
  if (draft.dueTime) {
    const match = TIME_PATTERN.exec(draft.dueTime);
    if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
      errors.dueTime = 'Use a time between 00:00 and 23:59.';
    }
  }
  return errors;
}

export function isDateKey(value: string): boolean {
  const match = DATE_KEY_PATTERN.exec(value);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDateKey(dateKey: string): Date {
  if (!isDateKey(dateKey)) throw new Error(`Invalid local date key: ${dateKey}`);
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function shiftDateKey(dateKey: string, days: number): string {
  const date = parseLocalDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
}

export function normalizeTaskDraft(draft: TaskDraft): Required<TaskDraft> {
  return {
    title: normalizeTaskTitle(draft.title),
    notes: draft.notes?.trim() ?? '',
    dueDate: draft.dueDate,
    dueTime: draft.dueTime || null,
    priority: draft.priority ?? 'normal',
    category: draft.category?.trim() ?? '',
  };
}
