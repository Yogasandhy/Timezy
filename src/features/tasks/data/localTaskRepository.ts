import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { createTaskRepository } from './taskRepository';

const store = createAsyncStorage('timezy');

export const taskRepository = createTaskRepository({
  getItem: key => store.getItem(key),
  setItem: (key, value) => store.setItem(key, value),
});

export const preferenceStorage = store;
