import {
  isDateKey,
  normalizeTaskDraft,
  Task,
  TaskDraft,
  TaskPriority,
  validateTaskDraft,
} from '../domain/task';

export const STORAGE_KEY = 'timezy.tasks.v1';
const SCHEMA_VERSION = 1;

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export type RepositoryErrorCode =
  | 'corrupt-data'
  | 'storage-read'
  | 'storage-write'
  | 'not-found'
  | 'invalid-task';

export class RepositoryError extends Error {
  constructor(readonly code: RepositoryErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'RepositoryError';
  }
}

export type RepositoryOptions = {
  now?: () => string;
  createId?: () => string;
};

export type TaskRepository = {
  getAll(): Promise<Task[]>;
  create(draft: TaskDraft): Promise<Task>;
  update(id: string, draft: TaskDraft): Promise<Task>;
  setCompleted(id: string, completed: boolean): Promise<Task>;
  delete(id: string): Promise<void>;
};

type StoredPayload = { version: number; tasks: Task[] };

function isPriority(value: unknown): value is TaskPriority {
  return value === 'low' || value === 'normal' || value === 'high';
}

export function isStoredTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const task = value as Partial<Task>;
  if (
    typeof task.id !== 'string' || task.id.length === 0 ||
    typeof task.title !== 'string' || task.title.trim().length === 0 ||
    typeof task.notes !== 'string' || typeof task.dueDate !== 'string' || !isDateKey(task.dueDate) ||
    (task.dueTime !== null && typeof task.dueTime !== 'string') ||
    !isPriority(task.priority) || typeof task.category !== 'string' ||
    typeof task.createdAt !== 'string' || typeof task.updatedAt !== 'string' ||
    (task.completedAt !== null && typeof task.completedAt !== 'string')
  ) return false;
  return task.title === task.title.trim() && Object.keys(validateTaskDraft({
    title: task.title,
    dueDate: task.dueDate,
    dueTime: task.dueTime,
  })).length === 0;
}

function createRandomId(): string {
  return `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createTaskRepository(
  storage: KeyValueStorage,
  options: RepositoryOptions = {},
): TaskRepository {
  const now = options.now ?? (() => new Date().toISOString());
  const createId = options.createId ?? createRandomId;
  let tail: Promise<void> = Promise.resolve();

  function runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    const result = tail.then(operation, operation);
    tail = result.then(() => undefined, () => undefined);
    return result;
  }

  async function readTasks(): Promise<Task[]> {
    let raw: string | null;
    try {
      raw = await storage.getItem(STORAGE_KEY);
    } catch (cause) {
      throw new RepositoryError('storage-read', 'Could not read saved tasks.', { cause });
    }
    if (raw === null) return [];

    let payload: StoredPayload;
    try {
      payload = JSON.parse(raw) as StoredPayload;
    } catch (cause) {
      throw new RepositoryError('corrupt-data', 'Saved task data could not be read. It has been left untouched.', { cause });
    }
    if (
      !payload || payload.version !== SCHEMA_VERSION || !Array.isArray(payload.tasks) ||
      !payload.tasks.every(isStoredTask)
    ) {
      throw new RepositoryError('corrupt-data', 'Saved task data has an unsupported or invalid format. It has been left untouched.');
    }
    return payload.tasks;
  }

  async function writeTasks(tasks: Task[]): Promise<void> {
    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, tasks }));
    } catch (cause) {
      throw new RepositoryError('storage-write', 'Could not save this change. Your previous tasks are unchanged.', { cause });
    }
  }

  function normalizeAndValidate(draft: TaskDraft): Required<TaskDraft> {
    const errors = validateTaskDraft(draft);
    if (Object.keys(errors).length > 0) {
      throw new RepositoryError('invalid-task', Object.values(errors)[0] ?? 'Check the task details.');
    }
    return normalizeTaskDraft(draft);
  }

  return {
    getAll: () => runExclusive(readTasks),

    create: draft => runExclusive(async () => {
      const clean = normalizeAndValidate(draft);
      const tasks = await readTasks();
      const timestamp = now();
      const task: Task = {
        ...clean,
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        completedAt: null,
      };
      await writeTasks([...tasks, task]);
      return task;
    }),

    update: (id, draft) => runExclusive(async () => {
      const clean = normalizeAndValidate(draft);
      const tasks = await readTasks();
      const index = tasks.findIndex(task => task.id === id);
      if (index < 0) throw new RepositoryError('not-found', 'This task is no longer available.');
      const updated: Task = { ...tasks[index], ...clean, updatedAt: now() };
      const nextTasks = [...tasks];
      nextTasks[index] = updated;
      await writeTasks(nextTasks);
      return updated;
    }),

    setCompleted: (id, completed) => runExclusive(async () => {
      const tasks = await readTasks();
      const index = tasks.findIndex(task => task.id === id);
      if (index < 0) throw new RepositoryError('not-found', 'This task is no longer available.');
      const current = tasks[index];
      if ((current.completedAt !== null) === completed) return current;
      const timestamp = now();
      const updated: Task = { ...current, completedAt: completed ? timestamp : null, updatedAt: timestamp };
      const nextTasks = [...tasks];
      nextTasks[index] = updated;
      await writeTasks(nextTasks);
      return updated;
    }),

    delete: id => runExclusive(async () => {
      const tasks = await readTasks();
      const remaining = tasks.filter(task => task.id !== id);
      if (remaining.length === tasks.length) throw new RepositoryError('not-found', 'This task is no longer available.');
      await writeTasks(remaining);
    }),
  };
}
