import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getLocalDateKey, parseLocalDateKey, shiftDateKey } from '../domain/task';
import { selectTasks } from '../domain/selectors';
import { useTasks } from '../state/TaskContext';
import { TabScreenProps } from '../../../app/navigation/types';
import { colors, radii, spacing } from '../../../shared/theme/tokens';
import { DatePickerSheet } from '../../../shared/components/DatePickerSheet';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ScreenBrand } from '../../../shared/components/ScreenBrand';
import { ScreenLayout } from '../../../shared/components/ScreenLayout';
import { Surface } from '../../../shared/components/Surface';
import { TaskErrorBanner } from '../../../shared/components/TaskErrorBanner';
import { TaskRow } from '../../../shared/components/TaskRow';
import { useAuth } from '../../auth/state/AuthContext';

export function CalendarScreen({ navigation }: TabScreenProps<'Calendar'>) {
  const { tasks, error, clearError, setTaskCompleted } = useTasks();
  const { signOut } = useAuth();
  const today = getLocalDateKey();
  const [selectedDate, setSelectedDate] = useState(today);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const selected = parseLocalDateKey(selectedDate);
  const weekStart = shiftDateKey(selectedDate, -selected.getDay());
  const week = useMemo(() => Array.from({ length: 7 }, (_, index) => shiftDateKey(weekStart, index)), [weekStart]);
  const dayTasks = selectTasks(tasks, { date: selectedDate });
  const selectedLabel = selected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <ScreenLayout>
      <ScreenBrand eyebrow="PLAN AHEAD" title="Your planner" onSignOut={() => { signOut().catch(() => undefined); }} />
      {error ? <TaskErrorBanner message={error} onDismiss={clearError} /> : null}
      <Surface style={styles.calendarCard}>
        <View style={styles.monthRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous week" onPress={() => setSelectedDate(shiftDateKey(selectedDate, -7))} style={styles.weekButton}><Text style={styles.arrow}>‹</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Open date picker" onPress={() => setDatePickerVisible(true)} style={styles.monthButton}>
            <Text style={styles.monthTitle}>{selected.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}⌄</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Next week" onPress={() => setSelectedDate(shiftDateKey(selectedDate, 7))} style={styles.weekButton}><Text style={styles.arrow}>›</Text></Pressable>
        </View>
        <View style={styles.weekRow}>
          {week.map(date => {
            const value = parseLocalDateKey(date);
            const active = date === selectedDate;
            const isToday = date === today;
            return (
              <Pressable
                key={date}
                accessibilityRole="button"
                accessibilityLabel={value.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                accessibilityState={{ selected: active }}
                onPress={() => setSelectedDate(date)}
                style={[styles.day, active && styles.dayActive, isToday && !active && styles.dayToday]}>
                <Text style={[styles.dayName, active && styles.dayNameActive]}>{value.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}</Text>
                <Text style={[styles.dayNumber, active && styles.dayNumberActive]}>{value.getDate()}</Text>
                {tasks.some(task => task.dueDate === date) ? <View style={[styles.dot, active && styles.dotActive]} /> : <View style={styles.dotPlaceholder} />}
              </Pressable>
            );
          })}
        </View>
      </Surface>

      <View style={styles.sectionHeading}>
        <View><Text style={styles.sectionTitle}>{selectedLabel}</Text><Text style={styles.sectionSubtitle}>{dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'} planned</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Add task for selected date" onPress={() => navigation.navigate('TaskForm', { initialDueDate: selectedDate })} style={styles.addButton}>
          <Text style={styles.addText}>＋</Text>
        </Pressable>
      </View>

      {dayTasks.length === 0 ? (
        <Surface style={styles.emptyCard}><EmptyState title="A clear day" body="No tasks for this date. Add something when it feels right." /></Surface>
      ) : dayTasks.map(task => (
          <TaskRow key={task.id} task={task} onPress={() => navigation.navigate('TaskForm', { taskId: task.id })} onToggle={() => { setTaskCompleted(task.id, task.completedAt === null).catch(() => undefined); }} />
      ))}

      <DatePickerSheet visible={datePickerVisible} value={selectedDate} onClose={() => setDatePickerVisible(false)} onSelect={date => { setSelectedDate(date); setDatePickerVisible(false); }} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  calendarCard: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg, marginBottom: spacing.xxl },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  monthButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md },
  monthTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  weekButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  arrow: { fontSize: 27, lineHeight: 31, color: colors.primary },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: '13.5%', minHeight: 74, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', gap: 4 },
  dayActive: { backgroundColor: colors.primary },
  dayToday: { borderWidth: 1, borderColor: colors.primary },
  dayName: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  dayNameActive: { color: '#DCE8D9' },
  dayNumber: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  dayNumberActive: { color: colors.white },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary },
  dotActive: { backgroundColor: colors.white },
  dotPlaceholder: { width: 4, height: 4 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  sectionTitle: { color: colors.textPrimary, fontSize: 19, fontWeight: '800' },
  sectionSubtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
  addButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  addText: { color: colors.white, fontSize: 25, fontWeight: '500', lineHeight: 28 },
  emptyCard: { padding: 0 },
});
