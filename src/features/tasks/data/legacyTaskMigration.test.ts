import { Task } from '../domain/task';
import { createLegacyTaskMigrator, LEGACY_IMPORT_KEY } from './legacyTaskMigration';

const task: Task = {
  id: 'task-one',
  title: 'Plan the week',
  notes: '',
  dueDate: '2026-10-16',
  dueTime: null,
  priority: 'normal',
  category: '',
  createdAt: '2026-10-16T00:00:00.000Z',
  updatedAt: '2026-10-16T00:00:00.000Z',
  completedAt: null,
};

function makeStorage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => { values.set(key, value); },
  };
}

describe('legacy local task migration', () => {
  it('imports once, records completion, and never deletes the source data', async () => {
    const storage = makeStorage();
    const localRepository = { getAll: jest.fn(async () => [task]) };
    const importTasks = jest.fn(async (_tasks: Task[]) => undefined);
    const migrate = createLegacyTaskMigrator({ storage, localRepository, importTasks });

    await migrate('user-a');
    await migrate('user-a');

    expect(importTasks).toHaveBeenCalledTimes(1);
    expect(importTasks).toHaveBeenCalledWith([task]);
    expect(JSON.parse(storage.values.get(LEGACY_IMPORT_KEY)!)).toEqual({ uid: 'user-a', status: 'complete' });
  });

  it('does not expose a previous user’s legacy tasks to a different account', async () => {
    const storage = makeStorage();
    const localRepository = { getAll: jest.fn(async () => [task]) };
    const importTasks = jest.fn(async (_tasks: Task[]) => undefined);
    const migrate = createLegacyTaskMigrator({ storage, localRepository, importTasks });

    await migrate('user-a');
    await migrate('user-b');

    expect(importTasks).toHaveBeenCalledTimes(1);
    expect(localRepository.getAll).toHaveBeenCalledTimes(1);
  });

  it('keeps the same account eligible to retry after an interrupted import', async () => {
    const storage = makeStorage();
    const localRepository = { getAll: jest.fn(async () => [task]) };
    const importTasks = jest.fn()
      .mockRejectedValueOnce(new Error('temporary network failure'))
      .mockResolvedValueOnce(undefined);
    const migrate = createLegacyTaskMigrator({ storage, localRepository, importTasks });

    await expect(migrate('user-a')).rejects.toThrow('temporary network failure');
    expect(JSON.parse(storage.values.get(LEGACY_IMPORT_KEY)!)).toEqual({ uid: 'user-a', status: 'in-progress' });
    await migrate('user-a');
    expect(JSON.parse(storage.values.get(LEGACY_IMPORT_KEY)!)).toEqual({ uid: 'user-a', status: 'complete' });
  });
});
