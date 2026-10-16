import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TaskRow } from './TaskRow';
import { Task } from '../../features/tasks/domain/task';

const task: Task = {
  id: 'task-1', title: 'Plan the week', notes: '', dueDate: '2026-10-16', dueTime: '09:30',
  priority: 'normal', category: 'Work', createdAt: '2026-10-15T10:00:00.000Z',
  updatedAt: '2026-10-15T10:00:00.000Z', completedAt: null,
};

describe('TaskRow', () => {
  it('exposes task completion as an accessible checked control', async () => {
    const onToggle = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<TaskRow task={task} onPress={jest.fn()} onToggle={onToggle} />);
    });
    const checkbox = tree?.root.findByProps({ accessibilityRole: 'checkbox' });
    expect(checkbox?.props.accessibilityState).toEqual({ checked: false });
    await ReactTestRenderer.act(() => checkbox?.props.onPress());
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows completed state without relying on color alone', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<TaskRow task={{ ...task, completedAt: '2026-10-16T09:00:00.000Z' }} onPress={jest.fn()} onToggle={jest.fn()} />);
    });
    expect(tree?.root.findByProps({ accessibilityRole: 'checkbox' }).props.accessibilityState).toEqual({ checked: true });
    expect(tree?.root.findByProps({ children: '✓' })).toBeTruthy();
  });
});
