import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TaskFormScreenProps } from '../../../app/navigation/types';
import { DatePickerSheet } from '../../../shared/components/DatePickerSheet';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { Task } from '../domain/task';
import { TaskFormScreen } from './TaskFormScreen';

const mockTasks = {
  tasks: [] as Task[],
  error: null,
  clearError: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
};

jest.mock('../state/TaskContext', () => ({ useTasks: () => mockTasks }));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: jest.requireActual('react-native').View,
}));
jest.mock('../../../shared/components/DatePickerSheet', () => ({
  DatePickerSheet: () => null,
}));

describe('task form', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  const goBack = jest.fn();
  const navigation = { goBack } as unknown as TaskFormScreenProps['navigation'];
  const task: Task = {
    id: 'existing',
    title: 'Read a chapter',
    notes: 'A quiet moment',
    dueDate: '2026-10-22',
    dueTime: null,
    priority: 'low',
    category: 'Personal',
    createdAt: '2026-10-20T09:00:00.000Z',
    updatedAt: '2026-10-20T09:00:00.000Z',
    completedAt: null,
  };

  async function render(
    params: TaskFormScreenProps['route']['params'] = {
      initialDueDate: '2026-10-22',
    },
  ) {
    await act(() => {
      renderer = ReactTestRenderer.create(
        <TaskFormScreen
          navigation={navigation}
          route={{ key: 'form', name: 'TaskForm', params }}
        />,
      );
    });
  }

  async function changeField(label: string, value: string) {
    await act(() =>
      renderer.root
        .findByProps({ accessibilityLabel: label })
        .props.onChangeText(value),
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockTasks.tasks = [];
    mockTasks.createTask.mockResolvedValue(task);
    mockTasks.updateTask.mockResolvedValue(task);
  });

  afterEach(async () => {
    if (renderer) await act(() => renderer.unmount());
  });

  it('keeps date, priority, category, time and notes in a newly created task', async () => {
    await render();
    await changeField('Task name', 'Read a chapter');
    await changeField('Optional notes', 'A quiet moment');
    await changeField('Optional time', '09:30');
    await changeField('Optional category', 'Books');
    await act(() =>
      renderer.root
        .findByProps({ accessibilityLabel: 'High priority' })
        .props.onPress(),
    );
    await act(() =>
      renderer.root.findByType(DatePickerSheet).props.onSelect('2026-10-23'),
    );
    await act(async () => {
      renderer.root.findByType(PrimaryButton).props.onPress();
    });
    expect(mockTasks.createTask).toHaveBeenCalledWith({
      title: 'Read a chapter',
      notes: 'A quiet moment',
      dueDate: '2026-10-23',
      dueTime: '09:30',
      priority: 'high',
      category: 'Books',
    });
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('does not save an empty title', async () => {
    await render();
    await act(async () => {
      renderer.root.findByType(PrimaryButton).props.onPress();
    });
    expect(mockTasks.createTask).not.toHaveBeenCalled();
    expect(
      renderer.root.findByProps({ children: 'Add a task title to continue.' }),
    ).toBeTruthy();
  });

  it('rejects invalid optional times before writing', async () => {
    await render();
    await changeField('Task name', 'Read');
    await changeField('Optional time', '25:00');
    await act(async () => {
      renderer.root.findByType(PrimaryButton).props.onPress();
    });
    expect(mockTasks.createTask).not.toHaveBeenCalled();
    expect(
      renderer.root.findByProps({
        children: 'Use a time between 00:00 and 23:59.',
      }),
    ).toBeTruthy();
  });

  it('loads existing values and updates the original task', async () => {
    mockTasks.tasks = [task];
    await render({ taskId: task.id });
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Optional notes' }).props
        .value,
    ).toBe('A quiet moment');
    await changeField('Task name', 'Read two chapters');
    await act(async () => {
      renderer.root.findByType(PrimaryButton).props.onPress();
    });
    expect(mockTasks.updateTask).toHaveBeenCalledWith(
      'existing',
      expect.objectContaining({
        title: 'Read two chapters',
        category: 'Personal',
        priority: 'low',
        dueTime: null,
      }),
    );
    expect(mockTasks.createTask).not.toHaveBeenCalled();
  });
});
