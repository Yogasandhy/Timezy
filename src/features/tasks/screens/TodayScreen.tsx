import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getLocalDateKey } from '../domain/task';
import { getCompletionSummary, selectTasks } from '../domain/selectors';
import { useTasks } from '../state/TaskContext';
import { TabScreenProps } from '../../../app/navigation/types';
import { colors, radii, spacing } from '../../../shared/theme/tokens';
import { EmptyState } from '../../../shared/components/EmptyState';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScreenBrand } from '../../../shared/components/ScreenBrand';
import { ScreenLayout } from '../../../shared/components/ScreenLayout';
import { Surface } from '../../../shared/components/Surface';
import { TaskErrorBanner } from '../../../shared/components/TaskErrorBanner';
import { TaskRow } from '../../../shared/components/TaskRow';

export function TodayScreen({ navigation }: TabScreenProps<'Today'>) {
  const { tasks, error, clearError, setTaskCompleted } = useTasks();
  const date = new Date();
  const today = getLocalDateKey(date);
  const greeting = date.getHours() < 12 ? 'Good morning' : date.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const readableDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const summary = getCompletionSummary(tasks, today);
  const todaysTasks = selectTasks(tasks, { date: today });

  const addTask = () => navigation.navigate('TaskForm', { initialDueDate: today });

  return (
    <ScreenLayout>
      <ScreenBrand eyebrow={readableDate} title={`${greeting}.`} />
      {error ? <TaskErrorBanner message={error} onDismiss={clearError} /> : null}

      <Surface style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View style={styles.summaryTitleWrap}>
            <Text style={styles.summaryEyebrow}>YOUR DAILY RHYTHM</Text>
            <Text style={styles.summaryTitle}>{summary.remaining === 0 && summary.total > 0 ? 'Beautifully done' : 'Small steps count'}</Text>
          </View>
          <View style={styles.progressCircle}><Text style={styles.progressNumber}>{summary.progress}%</Text></View>
        </View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${summary.progress}%` }]} /></View>
        <View style={styles.summaryStats}>
          <Stat number={summary.total} label="Tasks" />
          <View style={styles.statDivider} />
          <Stat number={summary.completed} label="Done" />
          <View style={styles.statDivider} />
          <Stat number={summary.remaining} label="To go" />
        </View>
      </Surface>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Today</Text>
          <Text style={styles.sectionSubtitle}>{summary.total === 1 ? '1 gentle reminder' : `${summary.total} things on your list`}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={addTask} style={styles.addSmall}>
          <Text style={styles.addSmallText}>＋ Add</Text>
        </Pressable>
      </View>

      {todaysTasks.length === 0 ? (
        <Surface style={styles.emptyCard}>
          <EmptyState title="A little room to breathe" body="Nothing scheduled yet. Add one task when you’re ready." />
        </Surface>
      ) : todaysTasks.map(task => (
        <TaskRow
          key={task.id}
          task={task}
          onPress={() => navigation.navigate('TaskForm', { taskId: task.id })}
          onToggle={() => { setTaskCompleted(task.id, task.completedAt === null).catch(() => undefined); }}
        />
      ))}

      <PrimaryButton label="＋   Add a task" onPress={addTask} style={styles.addButton} />
    </ScreenLayout>
  );
}

function Stat({ number, label }: { number: number; label: string }) {
  return <View style={styles.stat}><Text style={styles.statNumber}>{number}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  summaryCard: { padding: spacing.xl, backgroundColor: '#EEF2E8', borderColor: '#FFFFFF', marginBottom: spacing.xxl },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryTitleWrap: { flex: 1 },
  summaryEyebrow: { color: colors.textSecondary, fontSize: 10, letterSpacing: 1, fontWeight: '800' },
  summaryTitle: { color: colors.textPrimary, fontSize: 19, fontWeight: '800', marginTop: 6 },
  progressCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  progressNumber: { color: colors.white, fontSize: 13, fontWeight: '800' },
  progressTrack: { height: 8, borderRadius: radii.pill, backgroundColor: '#D5DED0', marginTop: spacing.lg, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radii.pill },
  summaryStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: spacing.lg },
  stat: { alignItems: 'center', minWidth: 56 },
  statNumber: { color: colors.textPrimary, fontSize: 19, fontWeight: '800' },
  statLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 26, backgroundColor: colors.outline },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  sectionTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: '800' },
  sectionSubtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
  addSmall: { paddingHorizontal: spacing.md, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.primarySoft },
  addSmallText: { color: colors.primary, fontWeight: '800' },
  emptyCard: { padding: 0, marginBottom: spacing.md },
  addButton: { marginTop: spacing.sm },
});
