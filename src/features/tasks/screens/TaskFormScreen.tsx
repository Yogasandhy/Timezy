import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { TaskFormScreenProps } from '../../../app/navigation/types';
import { DatePickerSheet } from '../../../shared/components/DatePickerSheet';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { Surface } from '../../../shared/components/Surface';
import { TaskErrorBanner } from '../../../shared/components/TaskErrorBanner';
import { colors, radii, spacing } from '../../../shared/theme/tokens';
import { TaskPriority, validateTaskDraft } from '../domain/task';
import { useTasks } from '../state/TaskContext';

const priorityChoices: { key: TaskPriority; label: string; hint: string }[] = [
  { key: 'low', label: 'Low', hint: 'Whenever' },
  { key: 'normal', label: 'Normal', hint: 'Important' },
  { key: 'high', label: 'High', hint: 'Focus first' },
];

export function TaskFormScreen({ navigation, route }: TaskFormScreenProps) {
  const { tasks, error, clearError, createTask, updateTask, deleteTask } = useTasks();
  const taskId = route.params?.taskId;
  const initialDueDate = route.params?.initialDueDate;
  const existing = taskId ? tasks.find(item => item.id === taskId) : undefined;
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState(initialDueDate ?? localToday());
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [category, setCategory] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string; dueTime?: string }>({});

  useEffect(() => {
    setTitle(existing?.title ?? '');
    setNotes(existing?.notes ?? '');
    setDueDate(existing?.dueDate ?? initialDueDate ?? localToday());
    setDueTime(existing?.dueTime ?? '');
    setPriority(existing?.priority ?? 'normal');
    setCategory(existing?.category ?? '');
    setErrors({});
    clearError();
  }, [taskId, initialDueDate, existing, clearError]);

  const draft = { title, notes, dueDate, dueTime: dueTime.trim() || null, priority, category };

  const save = async () => {
    const validation = validateTaskDraft(draft);
    setErrors(validation);
    if (Object.keys(validation).length > 0 || saving) return;
    setSaving(true);
    try {
      if (taskId) await updateTask(taskId, draft);
      else await createTask(draft);
      navigation.goBack();
    } catch {
      // The shared task error banner explains the persistence failure; the form stays open for retry.
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert('Delete this task?', `“${existing.title}” will be removed from your list.`, [
      { text: 'Keep task', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteTask(existing.id).then(() => navigation.goBack()).catch(() => undefined); } },
    ]);
  };

  if (taskId && !existing) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingTitle}>Task not found</Text>
        <Text style={styles.secondary}>It may have been removed from another screen.</Text>
        <PrimaryButton label="Go back" onPress={() => navigation.goBack()} style={styles.missingButton} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{taskId ? 'Edit task' : 'A new step'}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
          {error ? <TaskErrorBanner message={error} onDismiss={clearError} /> : null}
          <FieldLabel label="Task name" required />
          <TextInput
            accessibilityLabel="Task name"
            value={title}
            onChangeText={value => { setTitle(value); setErrors(current => ({ ...current, title: undefined })); }}
            placeholder="What would you like to do?"
            placeholderTextColor="#899289"
            returnKeyType="next"
            style={[styles.input, errors.title && styles.inputError]}
          />
          {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

          <FieldLabel label="Date" required />
          <Pressable accessibilityRole="button" accessibilityLabel={`Choose date, ${dueDate}`} onPress={() => setDatePickerVisible(true)} style={styles.dateButton}>
            <Text style={styles.dateGlyph}>▦</Text>
            <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
            <Text style={styles.dateChevron}>⌄</Text>
          </Pressable>
          {errors.dueDate ? <Text style={styles.errorText}>{errors.dueDate}</Text> : null}

          <View style={styles.optionalRow}>
            <View style={styles.optionalLabel}><FieldLabel label="Time" /></View>
            <TextInput
              accessibilityLabel="Optional time"
              value={dueTime}
              onChangeText={value => { setDueTime(value); setErrors(current => ({ ...current, dueTime: undefined })); }}
              placeholder="09:30"
              placeholderTextColor="#899289"
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              style={[styles.input, styles.timeInput, errors.dueTime && styles.inputError]}
            />
          </View>
          {errors.dueTime ? <Text style={styles.errorText}>{errors.dueTime}</Text> : null}

          <FieldLabel label="Priority" />
          <View style={styles.priorityRow}>
            {priorityChoices.map(choice => {
              const selected = priority === choice.key;
              return (
                <Pressable key={choice.key} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setPriority(choice.key)} style={[styles.priorityCard, selected && styles.priorityCardSelected]}>
                  <View style={[styles.priorityDot, styles[`priorityDot_${choice.key}`]]} />
                  <Text style={[styles.priorityLabel, selected && styles.priorityLabelSelected]}>{choice.label}</Text>
                  <Text style={styles.priorityHint}>{choice.hint}</Text>
                </Pressable>
              );
            })}
          </View>

          <FieldLabel label="Category" optional />
          <TextInput accessibilityLabel="Optional category" value={category} onChangeText={setCategory} placeholder="Work, personal…" placeholderTextColor="#899289" maxLength={30} style={styles.input} />

          <FieldLabel label="Notes" optional />
          <TextInput accessibilityLabel="Optional notes" value={notes} onChangeText={setNotes} placeholder="Add a little more detail" placeholderTextColor="#899289" multiline textAlignVertical="top" maxLength={500} style={[styles.input, styles.notesInput]} />

          <Surface inset style={styles.privacyNote}>
            <Text style={styles.privacyGlyph}>◌</Text>
            <Text style={styles.privacyText}>Saved on this device. Your tasks stay yours.</Text>
          </Surface>
          <PrimaryButton label={taskId ? 'Save changes' : 'Save task'} onPress={() => { save(); }} loading={saving} style={styles.saveButton} />
          {taskId ? <Pressable accessibilityRole="button" onPress={confirmDelete} style={styles.deleteButton}><Text style={styles.deleteText}>Delete task</Text></Pressable> : null}
        </ScrollView>
      </View>
      <DatePickerSheet visible={datePickerVisible} value={dueDate} onClose={() => setDatePickerVisible(false)} onSelect={date => { setDueDate(date); setErrors(current => ({ ...current, dueDate: undefined })); setDatePickerVisible(false); }} />
    </KeyboardAvoidingView>
  );
}

function FieldLabel({ label, required = false, optional = false }: { label: string; required?: boolean; optional?: boolean }) {
  return <Text style={styles.fieldLabel}>{label}{required ? <Text style={styles.required}> *</Text> : null}{optional ? <Text style={styles.optional}>  OPTIONAL</Text> : null}</Text>;
}

function localToday(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.canvas },
  page: { flex: 1, backgroundColor: colors.canvas, paddingTop: spacing.sm },
  header: { minHeight: 56, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  backGlyph: { fontSize: 31, lineHeight: 34, color: colors.primary },
  headerTitle: { flex: 1, color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  headerSpacer: { width: 44 },
  form: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxxl },
  fieldLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: '800', marginTop: spacing.lg, marginBottom: spacing.sm },
  required: { color: colors.danger },
  optional: { color: colors.textSecondary, fontSize: 9, letterSpacing: 0.8, fontWeight: '700' },
  input: { minHeight: 52, borderWidth: 1, borderColor: colors.outline, borderRadius: radii.md, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, color: colors.textPrimary, fontSize: 15 },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 12, marginTop: spacing.xs },
  dateButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.outline, borderRadius: radii.md, backgroundColor: colors.surface },
  dateGlyph: { color: colors.primary, fontSize: 19 },
  dateText: { flex: 1, color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  dateChevron: { color: colors.textSecondary, fontSize: 20 },
  optionalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  optionalLabel: { flex: 1 },
  timeInput: { width: 120, textAlign: 'center', paddingHorizontal: spacing.sm },
  priorityRow: { flexDirection: 'row', gap: spacing.sm },
  priorityCard: { flex: 1, minHeight: 78, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.outline, borderRadius: radii.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  priorityCardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 5 },
  priorityDot_low: { backgroundColor: colors.low },
  priorityDot_normal: { backgroundColor: colors.normal },
  priorityDot_high: { backgroundColor: colors.high },
  priorityLabel: { color: colors.textPrimary, fontSize: 13, fontWeight: '800' },
  priorityLabelSelected: { color: colors.primary },
  priorityHint: { color: colors.textSecondary, fontSize: 9, marginTop: 2 },
  notesInput: { minHeight: 94, paddingTop: spacing.md },
  privacyNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, marginTop: spacing.xl },
  privacyGlyph: { color: colors.primary, fontSize: 19 },
  privacyText: { flex: 1, color: colors.textSecondary, fontSize: 12 },
  saveButton: { marginTop: spacing.xl },
  deleteButton: { minHeight: 48, justifyContent: 'center', alignItems: 'center', marginTop: spacing.md },
  deleteText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  missing: { flex: 1, backgroundColor: colors.canvas, justifyContent: 'center', padding: spacing.xl },
  missingTitle: { color: colors.textPrimary, fontSize: 24, fontWeight: '800' },
  secondary: { color: colors.textSecondary, marginTop: spacing.sm },
  missingButton: { marginTop: spacing.xl },
});
