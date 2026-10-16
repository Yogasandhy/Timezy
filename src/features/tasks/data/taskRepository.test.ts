import { createTaskRepository, KeyValueStorage, STORAGE_KEY } from './taskRepository';

class MemoryStorage implements KeyValueStorage {
  value: string | null = null;
  failWrites = false;

  async getItem() {
    return this.value;
  }

  async setItem(_key: string, value: string) {
    if (this.failWrites) throw new Error('disk unavailable');
    this.value = value;
  }
}

const draft = (title: string) => ({ title, dueDate: '2026-10-16', priority: 'normal' as const });

describe('task repository', () => {
  it('loads empty state, writes a versioned payload, and round-trips tasks', async () => {
    const storage = new MemoryStorage();
    const repository = createTaskRepository(storage, {
      now: () => '2026-10-16T08:00:00.000Z',
      createId: () => 'task-1',
    });

    expect(await repository.getAll()).toEqual([]);
    const created = await repository.create(draft('  Review notes  '));
    expect(created.title).toBe('Review notes');
    expect(JSON.parse(storage.value!)).toMatchObject({ version: 1, tasks: [{ id: 'task-1' }] });
    expect(await repository.getAll()).toEqual([created]);
  });

  it('updates, completes, and deletes a task', async () => {
    const repository = createTaskRepository(new MemoryStorage(), {
      now: () => '2026-10-16T08:00:00.000Z', createId: () => 'task-1',
    });
    const created = await repository.create(draft('Review'));
    await repository.update(created.id, { ...draft('Ship review'), priority: 'high' });
    await repository.setCompleted(created.id, true);
    expect(await repository.getAll()).toMatchObject([{ title: 'Ship review', priority: 'high', completedAt: '2026-10-16T08:00:00.000Z' }]);
    await repository.setCompleted(created.id, false);
    expect((await repository.getAll())[0].completedAt).toBeNull();
    await repository.delete(created.id);
    expect(await repository.getAll()).toEqual([]);
  });

  it('rejects malformed storage without overwriting the original bytes', async () => {
    const storage = new MemoryStorage();
    storage.value = '{broken json';
    const repository = createTaskRepository(storage);
    await expect(repository.getAll()).rejects.toMatchObject({ code: 'corrupt-data' });
    await expect(repository.create(draft('Keep data safe'))).rejects.toMatchObject({ code: 'corrupt-data' });
    expect(storage.value).toBe('{broken json');
  });

  it('rejects structurally invalid saved tasks without replacing them', async () => {
    const storage = new MemoryStorage();
    storage.value = JSON.stringify({ version: 1, tasks: [{ id: 'bad', title: 'Broken', dueDate: '2026-10-16', dueTime: '25:70' }] });
    const original = storage.value;
    const repository = createTaskRepository(storage);
    await expect(repository.getAll()).rejects.toMatchObject({ code: 'corrupt-data' });
    expect(storage.value).toBe(original);
  });

  it('serializes concurrent writes so neither task is lost', async () => {
    let nextId = 0;
    const repository = createTaskRepository(new MemoryStorage(), {
      now: () => '2026-10-16T08:00:00.000Z', createId: () => `task-${++nextId}`,
    });
    await Promise.all([repository.create(draft('One')), repository.create(draft('Two'))]);
    expect((await repository.getAll()).map(task => task.title).sort()).toEqual(['One', 'Two']);
  });

  it('surfaces storage failures instead of pretending a write succeeded', async () => {
    const storage = new MemoryStorage();
    storage.failWrites = true;
    const repository = createTaskRepository(storage);
    await expect(repository.create(draft('No fake success'))).rejects.toMatchObject({ code: 'storage-write' });
    expect(storage.value).toBeNull();
    expect(STORAGE_KEY).toBe('timezy.tasks.v1');
  });
});
