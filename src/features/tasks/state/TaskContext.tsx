import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Task, TaskDraft } from '../domain/task';
import { taskRepository } from '../data/localTaskRepository';
import { RepositoryError } from '../data/taskRepository';

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await taskRepository.getAll());
      setLoaded(true);
    } catch (loadError) {
      setError(errorMessage(loadError));
      setLoaded(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const runMutation = useCallback(async <T,>(operation: () => Promise<T>, apply: (value: T) => void) => {
    setError(null);
    try {
      const value = await operation();
      apply(value);
      return value;
    } catch (mutationError) {
      setError(errorMessage(mutationError));
      throw mutationError;
    }
  }, []);

  const createTask = useCallback((draft: TaskDraft) => runMutation(
    () => taskRepository.create(draft),
    task => setTasks(current => [...current, task]),
  ), [runMutation]);

  const updateTask = useCallback((id: string, draft: TaskDraft) => runMutation(
    () => taskRepository.update(id, draft),
    task => setTasks(current => current.map(item => item.id === id ? task : item)),
  ), [runMutation]);

  const setTaskCompleted = useCallback((id: string, completed: boolean) => runMutation(
    () => taskRepository.setCompleted(id, completed),
    task => setTasks(current => current.map(item => item.id === id ? task : item)),
  ), [runMutation]);

  const deleteTask = useCallback((id: string) => runMutation<void>(
    () => taskRepository.delete(id),
    () => setTasks(current => current.filter(item => item.id !== id)),
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
