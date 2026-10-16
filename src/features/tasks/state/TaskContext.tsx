import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Task, TaskDraft } from '../domain/task';
import { createFirebaseTaskRepository, FirebaseTaskRepository, migrateLocalTasksToCloud } from '../data/firebaseTaskRepository';
import { RepositoryError } from '../data/taskRepository';
import { useAuth } from '../../auth/state/AuthContext';

type TaskContextValue = {
  tasks: Task[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearError: () => void;
  createTask: (draft: TaskDraft) => Promise<Task>;
  updateTask: (id: string, draft: TaskDraft) => Promise<Task>;
  setTaskCompleted: (id: string, completed: boolean) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
};

const TaskContext = createContext<TaskContextValue | null>(null);

function errorMessage(error: unknown): string {
  if (error instanceof RepositoryError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user, initializing: authInitializing } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const repositoryRef = useRef<FirebaseTaskRepository | null>(null);
  const uid = user?.uid;
  const clearError = useCallback(() => setError(null), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoaded(false);
    setError(null);
    setRetryVersion(version => version + 1);
  }, []);

  useEffect(() => {
    if (authInitializing) {
      setLoading(true);
      return;
    }

    if (!uid) {
      repositoryRef.current = null;
      setTasks([]);
      setError(null);
      setLoaded(true);
      setLoading(false);
      return;
    }

    let active = true;
    let unsubscribe: (() => void) | undefined;
    const repository = createFirebaseTaskRepository(uid);
    repositoryRef.current = repository;
    setTasks([]);
    setError(null);
    setLoaded(false);
    setLoading(true);

    migrateLocalTasksToCloud(uid, repository)
      .then(() => {
        if (!active) return;
        unsubscribe = repository.subscribeAll(nextTasks => {
          if (!active) return;
          setTasks(nextTasks);
          setLoaded(true);
          setLoading(false);
          setError(null);
        }, loadError => {
          if (!active) return;
          setError(errorMessage(loadError));
          setLoaded(false);
          setLoading(false);
        });
      })
      .catch(loadError => {
        if (!active) return;
        setError(errorMessage(loadError));
        setLoaded(false);
        setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe?.();
      if (repositoryRef.current === repository) repositoryRef.current = null;
    };
  }, [uid, authInitializing, retryVersion]);

  const runMutation = useCallback(async <T,>(operation: (repository: FirebaseTaskRepository) => Promise<T>) => {
    setError(null);
    try {
      const repository = repositoryRef.current;
      if (!repository) throw new Error('Sign in to sync and update your tasks.');
      return await operation(repository);
    } catch (mutationError) {
      setError(errorMessage(mutationError));
      throw mutationError;
    }
  }, []);

  const createTask = useCallback((draft: TaskDraft) => runMutation(
    repository => repository.create(draft),
  ), [runMutation]);

  const updateTask = useCallback((id: string, draft: TaskDraft) => runMutation(
    repository => repository.update(id, draft),
  ), [runMutation]);

  const setTaskCompleted = useCallback((id: string, completed: boolean) => runMutation(
    repository => repository.setCompleted(id, completed),
  ), [runMutation]);

  const deleteTask = useCallback((id: string) => runMutation<void>(
    repository => repository.delete(id),
  ), [runMutation]);

  const value = useMemo<TaskContextValue>(() => ({
    tasks, loading, loaded, error, refresh, clearError,
    createTask, updateTask, setTaskCompleted, deleteTask,
  }), [tasks, loading, loaded, error, refresh, clearError, createTask, updateTask, setTaskCompleted, deleteTask]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider.');
  return context;
}
