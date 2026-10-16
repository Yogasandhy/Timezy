import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TabScreenProps } from '../../../app/navigation/types';
import { EmptyState } from '../../../shared/components/EmptyState';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScreenBrand } from '../../../shared/components/ScreenBrand';
import { ScreenLayout } from '../../../shared/components/ScreenLayout';
import { Surface } from '../../../shared/components/Surface';
import { TaskErrorBanner } from '../../../shared/components/TaskErrorBanner';
import { TaskRow } from '../../../shared/components/TaskRow';
import { colors, radii, spacing } from '../../../shared/theme/tokens';
import { selectTasks, TaskStatusFilter } from '../domain/selectors';
import { getLocalDateKey, TaskPriority } from '../domain/task';
import { useTasks } from '../state/TaskContext';

const statusOptions: { value: TaskStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' }, { value: 'open', label: 'To do' }, { value: 'done', label: 'Done' },
];
const priorityOptions: { value: TaskPriority | 'any'; label: string }[] = [
  { value: 'any', label: 'Any priority' }, { value: 'high', label: 'High' }, { value: 'normal', label: 'Normal' }, { value: 'low', label: 'Low' },
];

export function TasksScreen({ navigation }: TabScreenProps<'Tasks'>) {
  const { tasks, error, clearError, setTaskCompleted } = useTasks();
  const [status, setStatus] = useState<TaskStatusFilter>('all');
  const [priority, setPriority] = useState<TaskPriority | 'any'>('any');
  const filtered = useMemo(() => selectTasks(tasks, { status, priority: priority === 'any' ? undefined : priority }), [tasks, status, priority]);
  const initialDate = getLocalDateKey();

  return (
    <ScreenLayout>
      <ScreenBrand eyebrow={`${tasks.length} ${tasks.length === 1 ? 'TASK' : 'TASKS'} IN YOUR LIST`} title="Your tasks" />
      {error ? <TaskErrorBanner message={error} onDismiss={clearError} /> : null}
      <View style={styles.filters}>
        {statusOptions.map(option => <FilterChip key={option.value} label={option.label} selected={status === option.value} onPress={() => setStatus(option.value)} />)}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.priorityFilters}>
        {priorityOptions.map(option => <FilterChip key={option.value} label={option.label} selected={priority === option.value} onPress={() => setPriority(option.value)} subtle />)}
      </ScrollView>

      {filtered.length === 0 ? (
        <Surface style={styles.emptyCard}>
          <EmptyState title={tasks.length === 0 ? 'Start with one thing' : 'Nothing in this view'} body={tasks.length === 0 ? 'Create a small task and give it a place in your day.' : 'Try another filter or add a task to this list.'} />
        </Surface>
      ) : filtered.map(task => (
        <TaskRow key={task.id} task={task} onPress={() => navigation.navigate('TaskForm', { taskId: task.id })} onToggle={() => { setTaskCompleted(task.id, task.completedAt === null).catch(() => undefined); }} />
      ))}
      <PrimaryButton label="＋   Add a task" onPress={() => navigation.navigate('TaskForm', { initialDueDate: initialDate })} style={styles.addButton} />
    </ScreenLayout>
  );
}

function FilterChip({ label, selected, onPress, subtle = false }: { label: string; selected: boolean; onPress: () => void; subtle?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, subtle && styles.chipSmall, selected && styles.chipSelected, subtle && selected && styles.chipSmallSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected, subtle && styles.chipTextSmall]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  priorityFilters: { gap: spacing.sm, paddingBottom: spacing.lg },
  chip: { minHeight: 42, minWidth: 78, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, borderWidth: 1, borderColor: colors.outline, paddingHorizontal: spacing.lg, backgroundColor: colors.surface },
  chipSmall: { minHeight: 36, minWidth: 70, paddingHorizontal: spacing.md, backgroundColor: 'transparent' },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipSmallSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  chipTextSmall: { fontSize: 12 },
  chipTextSelected: { color: colors.white },
  emptyCard: { padding: 0 },
  addButton: { marginTop: spacing.sm },
});
