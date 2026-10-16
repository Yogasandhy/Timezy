import { Task } from '../domain/task';
import { KeyValueStorage, RepositoryError, TaskRepository } from './taskRepository';

export const LEGACY_IMPORT_KEY = 'timezy.firebase.legacy-import.v1';

type LegacyImportState = { uid: string; status: 'in-progress' | 'complete' };

type LegacyTaskMigratorOptions = {
  storage: KeyValueStorage;
  localRepository: Pick<TaskRepository, 'getAll'>;
  importTasks: (tasks: Task[]) => Promise<void>;
};

export function createLegacyTaskMigrator({ storage, localRepository, importTasks }: LegacyTaskMigratorOptions) {
  return async (uid: string): Promise<void> => {
    const rawState = await storage.getItem(LEGACY_IMPORT_KEY);
    let state: LegacyImportState | null = null;
    if (rawState) {
      try {
        state = JSON.parse(rawState) as LegacyImportState;
      } catch (cause) {
        throw new RepositoryError('corrupt-data', 'Local sync status could not be read. Your saved tasks are unchanged.', { cause });
      }
      if (!state || typeof state.uid !== 'string' || (state.status !== 'in-progress' && state.status !== 'complete')) {
        throw new RepositoryError('corrupt-data', 'Local sync status has an unsupported format. Your saved tasks are unchanged.');
      }
      if (state.uid !== uid || state.status === 'complete') return;
    } else {
      state = { uid, status: 'in-progress' };
      await storage.setItem(LEGACY_IMPORT_KEY, JSON.stringify(state));
    }

    const localTasks = await localRepository.getAll();
    await importTasks(localTasks);
    await storage.setItem(LEGACY_IMPORT_KEY, JSON.stringify({ uid, status: 'complete' } satisfies LegacyImportState));
  };
}
