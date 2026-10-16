import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../../features/tasks/domain/task';
import { colors, radii, spacing } from '../theme/tokens';
import { Surface } from './Surface';

type Props = {
  task: Task;
  onPress: () => void;
  onToggle: () => void;
};

const priorityLabel = { low: 'Low', normal: 'Normal', high: 'High' } as const;

export function TaskRow({ task, onPress, onToggle }: Props) {
  const completed = task.completedAt !== null;
  return (
    <Surface style={styles.card}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={`${completed ? 'Mark as open' : 'Complete'} ${task.title}`}
          accessibilityState={{ checked: completed }}
          onPress={onToggle}
          hitSlop={8}
          style={[styles.check, completed && styles.checkDone]}>
          {completed ? <Text style={styles.checkGlyph}>✓</Text> : null}
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${task.title}`} onPress={onPress} style={styles.content}>
          <Text numberOfLines={2} style={[styles.title, completed && styles.titleDone]}>{task.title}</Text>
          <View style={styles.metaRow}>
            {task.dueTime ? <Text style={styles.meta}>{task.dueTime}</Text> : <Text style={styles.meta}>Anytime</Text>}
            {task.category ? <Text style={styles.meta}>· {task.category}</Text> : null}
            <Text style={[styles.priority, { color: colors[task.priority] }]}>{priorityLabel[task.priority]}</Text>
          </View>
        </Pressable>
        <Text accessibilityLabel={completed ? 'Completed' : 'Not completed'} style={styles.chevron}>›</Text>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  check: {
    width: 27, height: 27, borderRadius: radii.pill, borderWidth: 1.5,
    borderColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkGlyph: { color: colors.white, fontSize: 16, fontWeight: '800', lineHeight: 19 },
  content: { flex: 1, minHeight: 48, justifyContent: 'center' },
  title: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', lineHeight: 21 },
  titleDone: { color: colors.textSecondary, textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: spacing.sm, marginTop: 4 },
  meta: { color: colors.textSecondary, fontSize: 12 },
  priority: { fontSize: 11, fontWeight: '700' },
  chevron: { color: colors.textSecondary, fontSize: 25, marginLeft: spacing.xs },
});
