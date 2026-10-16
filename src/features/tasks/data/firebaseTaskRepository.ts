import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
  Unsubscribe,
} from '@react-native-firebase/firestore';
import { normalizeTaskDraft, Task, TaskDraft, validateTaskDraft } from '../domain/task';
import { isStoredTask, RepositoryError, TaskRepository } from './taskRepository';
import { preferenceStorage, taskRepository as localTaskRepository } from './localTaskRepository';
import { createLegacyTaskMigrator } from './legacyTaskMigration';

export type FirebaseTaskRepository = TaskRepository & {
  subscribeAll: (onTasks: (tasks: Task[]) => void, onError: (error: unknown) => void) => Unsubscribe;
  importTasksIfMissing: (tasks: Task[]) => Promise<void>;
};

function createId(): string {
  return `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((left, right) => {
    const dateOrder = left.dueDate.localeCompare(right.dueDate);
    if (dateOrder !== 0) return dateOrder;
    const leftTime = left.dueTime ?? '99:99';
    const rightTime = right.dueTime ?? '99:99';
    return leftTime.localeCompare(rightTime) || left.createdAt.localeCompare(right.createdAt);
  });
}

function validateDraft(draft: TaskDraft): Required<TaskDraft> {
  const errors = validateTaskDraft(draft);
  if (Object.keys(errors).length > 0) {
    throw new RepositoryError('invalid-task', Object.values(errors)[0] ?? 'Check the task details.');
  }
  return normalizeTaskDraft(draft);
}

function parseSnapshot(snapshot: { docs: Array<{ id: string; data: () => unknown }> }): Task[] {
  const tasks = snapshot.docs.map(document => document.data() as Task);
  if (!tasks.every(isStoredTask)) {
    throw new RepositoryError('corrupt-data', 'A saved cloud task has an invalid format. No cloud data was changed.');
  }
  return sortTasks(tasks);
}

export function createFirebaseTaskRepository(uid: string): FirebaseTaskRepository {
  const db = getFirestore();
  const tasksCollection = collection(db, 'users', uid, 'tasks');
  const taskCache = new Map<string, Task>();

  const remember = (tasks: Task[]) => {
    taskCache.clear();
    tasks.forEach(task => taskCache.set(task.id, task));
  };

  const readAll = async (): Promise<Task[]> => {
    const snapshot = await getDocs(tasksCollection);
    const tasks = parseSnapshot(snapshot);
    remember(tasks);
    return tasks;
  };

  return {
    getAll: readAll,

    subscribeAll: (onTasks, onError) => onSnapshot(tasksCollection, snapshot => {
      try {
        const tasks = parseSnapshot(snapshot);
        remember(tasks);
        onTasks(tasks);
      } catch (error) {
        onError(error);
      }
    }, onError),

    importTasksIfMissing: async tasks => {
      for (const task of tasks) {
        const taskRef = doc(tasksCollection, task.id);
        await runTransaction(db, async transaction => {
          const existing = await transaction.get(taskRef);
          if (!existing.exists()) transaction.set(taskRef, task);
        });
      }
    },

    create: async draft => {
      const clean = validateDraft(draft);
      const timestamp = new Date().toISOString();
      const task: Task = {
        ...clean,
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        completedAt: null,
      };
      await setDoc(doc(tasksCollection, task.id), task);
      taskCache.set(task.id, task);
      return task;
    },

    update: async (id, draft) => {
      const current = taskCache.get(id);
      if (!current) throw new RepositoryError('not-found', 'This task is no longer available.');
      const clean = validateDraft(draft);
      const updated: Task = { ...current, ...clean, updatedAt: new Date().toISOString() };
      await updateDoc(doc(tasksCollection, id), updated);
      taskCache.set(id, updated);
      return updated;
    },

    setCompleted: async (id, completed) => {
      const current = taskCache.get(id);
      if (!current) throw new RepositoryError('not-found', 'This task is no longer available.');
      if ((current.completedAt !== null) === completed) return current;
      const timestamp = new Date().toISOString();
      const updated: Task = { ...current, completedAt: completed ? timestamp : null, updatedAt: timestamp };
      await updateDoc(doc(tasksCollection, id), { completedAt: updated.completedAt, updatedAt: updated.updatedAt });
      taskCache.set(id, updated);
      return updated;
    },

    delete: async id => {
      if (!taskCache.has(id)) throw new RepositoryError('not-found', 'This task is no longer available.');
      await deleteDoc(doc(tasksCollection, id));
      taskCache.delete(id);
    },
  };
}

export async function migrateLocalTasksToCloud(uid: string, repository: FirebaseTaskRepository): Promise<void> {
  const migrateForUser = createLegacyTaskMigrator({
    storage: preferenceStorage,
    localRepository: localTaskRepository,
    importTasks: tasks => repository.importTasksIfMissing(tasks),
  });
  await migrateForUser(uid);
}
