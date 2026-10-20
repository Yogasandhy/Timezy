import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskFormScreenProps } from '../../../app/navigation/types';
import { AppIcon } from '../../../shared/components/AppIcon';
import { DatePickerSheet } from '../../../shared/components/DatePickerSheet';
import { KeyboardAwareScrollView } from '../../../shared/components/KeyboardAwareScrollView';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { Surface } from '../../../shared/components/Surface';
import { TaskErrorBanner } from '../../../shared/components/TaskErrorBanner';
import { colors, radii, spacing } from '../../../shared/theme/tokens';
import {
  getLocalDateKey,
  parseLocalDateKey,
  shiftDateKey,
  TaskPriority,
  validateTaskDraft,
} from '../domain/task';
import { useTasks } from '../state/TaskContext';

const priorities: {
  key: TaskPriority;
  label: string;
  hint: string;
  color: string;
  bars: number;
}[] = [
  { key: 'low', label: 'Low', hint: 'No rush', color: colors.low, bars: 1 },
  {
    key: 'normal',
    label: 'Normal',
    hint: 'On my list',
    color: colors.normal,
    bars: 2,
  },
  {
    key: 'high',
    label: 'High',
    hint: 'Do it first',
    color: colors.high,
    bars: 3,
  },
];
const categories = ['Personal', 'Work', 'Study', 'Health'];

export function TaskFormScreen({ navigation, route }: TaskFormScreenProps) {
  const { tasks, error, clearError, createTask, updateTask, deleteTask } =
    useTasks();
  const taskId = route.params?.taskId;
  const initialDueDate = route.params?.initialDueDate;
  const existing = taskId ? tasks.find(item => item.id === taskId) : undefined;
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState(initialDueDate ?? getLocalDateKey());
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [category, setCategory] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    title?: string;
    dueDate?: string;
    dueTime?: string;
  }>({});
  const titleInput = useRef<React.ComponentRef<typeof TextInput>>(null);
  const timeInput = useRef<React.ComponentRef<typeof TextInput>>(null);
  const categoryInput = useRef<React.ComponentRef<typeof TextInput>>(null);
  const notesInput = useRef<React.ComponentRef<typeof TextInput>>(null);
  const today = getLocalDateKey();
  const tomorrow = shiftDateKey(today, 1);

  useEffect(() => {
    setTitle(existing?.title ?? '');
    setNotes(existing?.notes ?? '');
    setDueDate(existing?.dueDate ?? initialDueDate ?? getLocalDateKey());
    setDueTime(existing?.dueTime ?? '');
    setPriority(existing?.priority ?? 'normal');
    setCategory(existing?.category ?? '');
    setErrors({});
    clearError();
  }, [taskId, initialDueDate, existing, clearError]);

  const draft = {
    title,
    notes,
    dueDate,
    dueTime: dueTime.trim() || null,
    priority,
    category,
  };

  const save = async () => {
    const validation = validateTaskDraft(draft);
    setErrors(validation);
    if (Object.keys(validation).length > 0 || saving) {
      if (validation.title) titleInput.current?.focus();
      else if (validation.dueTime) timeInput.current?.focus();
      return;
    }
    Keyboard.dismiss();
    setSaving(true);
    try {
      if (taskId) await updateTask(taskId, draft);
      else await createTask(draft);
      navigation.goBack();
    } catch {
      // Keep the draft available for retry; TaskProvider exposes the error.
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert(
      'Delete this task?',
      `“${existing.title}” will be removed from your list.`,
      [
        { text: 'Keep task', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTask(existing.id)
              .then(() => navigation.goBack())
              .catch(() => undefined);
          },
        },
      ],
    );
  };

  const chooseDate = () => {
    Keyboard.dismiss();
    setDatePickerVisible(true);
  };

  if (taskId && !existing) {
    return (
      <SafeAreaView style={styles.missing}>
        <Text style={styles.heading}>Task not found</Text>
        <Text style={styles.subtitle}>
          It may have been removed from another device.
        </Text>
        <PrimaryButton
          label="Go back"
          onPress={() => navigation.goBack()}
          style={styles.missingButton}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          disabled={saving}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <AppIcon name="back" />
        </Pressable>
        <Text style={styles.headerLabel}>
          {taskId ? 'TASK DETAILS' : 'YOUR NEXT STEP'}
        </Text>
        <View style={styles.headerBadge}>
          <AppIcon name="tasks" size={19} />
        </View>
      </View>

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.form}
      >
        <View style={styles.intro}>
          <Text style={styles.heading}>
            {taskId ? 'A little fine-tuning.' : 'Add a task.'}
          </Text>
          <Text style={styles.subtitle}>
            {taskId
              ? 'Make a little room for a change of plan.'
              : 'A small plan. A little more headspace.'}
          </Text>
        </View>

        <Surface style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>WHAT'S THE PLAN?</Text>
            <Text style={styles.required}>Required</Text>
          </View>
          <TextInput
            ref={titleInput}
            accessibilityLabel="Task name"
            editable={!saving}
            value={title}
            onChangeText={value => {
              setTitle(value);
              setErrors(current => ({ ...current, title: undefined }));
            }}
            onFocus={() => setFocused('title')}
            onBlur={() => setFocused(null)}
            onSubmitEditing={() => timeInput.current?.focus()}
            placeholder="What would you like to do?"
            placeholderTextColor="#7A8579"
            multiline
            scrollEnabled={false}
            maxLength={120}
            submitBehavior="submit"
            returnKeyType="next"
            style={[
              styles.input,
              styles.titleInput,
              focused === 'title' && styles.inputFocused,
              errors.title && styles.inputError,
            ]}
          />
          <View style={styles.fieldFooter}>
            <Text
              accessibilityRole={errors.title ? 'alert' : undefined}
              style={errors.title ? styles.errorText : styles.inputHint}
            >
              {errors.title ?? 'Keep it clear. Make it doable.'}
            </Text>
            <Text style={styles.counter}>{title.length}/120</Text>
          </View>
        </Surface>

        <Surface style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionIcon}>
              <AppIcon name="calendar" size={20} />
            </View>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Make some time</Text>
              <Text style={styles.inputHint}>Give it a place in your day.</Text>
            </View>
          </View>
          <View style={styles.dateShortcuts}>
            {[
              { key: today, label: 'Today' },
              { key: tomorrow, label: 'Tomorrow' },
            ].map(day => (
              <Pressable
                key={day.key}
                accessibilityRole="button"
                accessibilityState={{ selected: dueDate === day.key }}
                disabled={saving}
                onPress={() => setDueDate(day.key)}
                style={[
                  styles.dateChip,
                  dueDate === day.key && styles.dateChipActive,
                ]}
              >
                {dueDate === day.key ? (
                  <AppIcon name="check" size={14} />
                ) : null}
                <Text
                  style={[
                    styles.dateChipLabel,
                    dueDate === day.key && styles.dateChipLabelActive,
                  ]}
                >
                  {day.label}
                </Text>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose another date"
              disabled={saving}
              onPress={chooseDate}
              style={[
                styles.dateChip,
                dueDate !== today &&
                  dueDate !== tomorrow &&
                  styles.dateChipActive,
              ]}
            >
              <Text style={styles.dateChipLabel}>Pick a date</Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Choose date, ${dueDate}`}
            disabled={saving}
            onPress={chooseDate}
            style={styles.dateField}
          >
            <View style={styles.sectionCopy}>
              <Text style={styles.smallLabel}>SCHEDULED FOR</Text>
              <Text style={styles.dateText}>
                {parseLocalDateKey(dueDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <AppIcon name="down" size={20} />
          </Pressable>
          {errors.dueDate ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {errors.dueDate}
            </Text>
          ) : null}
          <View style={styles.timeRow}>
            <View style={styles.sectionCopy}>
              <Text style={styles.fieldTitle}>At a time</Text>
              <Text style={styles.inputHint}>
                Optional. Leave some flexibility.
              </Text>
            </View>
            <View
              style={[
                styles.timeField,
                focused === 'time' && styles.inputFocused,
                errors.dueTime && styles.inputError,
              ]}
            >
              <AppIcon name="clock" size={17} color={colors.textSecondary} />
              <TextInput
                ref={timeInput}
                accessibilityLabel="Optional time"
                editable={!saving}
                value={dueTime}
                onChangeText={value => {
                  setDueTime(value);
                  setErrors(current => ({ ...current, dueTime: undefined }));
                }}
                onFocus={() => setFocused('time')}
                onBlur={() => setFocused(null)}
                onSubmitEditing={() => categoryInput.current?.focus()}
                placeholder="HH:MM"
                placeholderTextColor="#7A8579"
                keyboardType="numbers-and-punctuation"
                returnKeyType="next"
                maxLength={5}
                style={styles.timeInput}
              />
            </View>
          </View>
          {errors.dueTime ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {errors.dueTime}
            </Text>
          ) : null}
        </Surface>

        <Surface style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>SET THE PACE</Text>
            <Text style={styles.optional}>Priority</Text>
          </View>
          <View accessibilityRole="radiogroup" style={styles.priorityRow}>
            {priorities.map(choice => {
              const selected = priority === choice.key;
              return (
                <Pressable
                  key={choice.key}
                  accessibilityRole="radio"
                  accessibilityLabel={`${choice.label} priority`}
                  accessibilityState={{ checked: selected }}
                  disabled={saving}
                  onPress={() => setPriority(choice.key)}
                  style={({ pressed }) => [
                    styles.priorityCard,
                    selected && styles.priorityCardSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.priorityBars}>
                    {[0, 1, 2].map(index => (
                      <View
                        key={index}
                        style={[
                          styles.priorityBar,
                          {
                            height: 7 + index * 4,
                            backgroundColor: selected
                              ? colors.white
                              : choice.color,
                          },
                          index >= choice.bars && styles.priorityBarMuted,
                        ]}
                      />
                    ))}
                  </View>
                  <Text
                    style={[
                      styles.priorityLabel,
                      selected && styles.priorityLabelSelected,
                    ]}
                  >
                    {choice.label}
                  </Text>
                  <Text
                    style={[
                      styles.priorityHint,
                      selected && styles.priorityHintSelected,
                    ]}
                  >
                    {choice.hint}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Surface>

        <Surface style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionIcon}>
              <AppIcon name="tag" size={20} />
            </View>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>A place for it</Text>
              <Text style={styles.inputHint}>
                An optional category to keep things tidy.
              </Text>
            </View>
          </View>
          <View style={styles.categoryChoices}>
            {categories.map(value => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: category === value }}
                disabled={saving}
                onPress={() =>
                  setCategory(current => (current === value ? '' : value))
                }
                style={[
                  styles.categoryChip,
                  category === value && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryLabel,
                    category === value && styles.categoryLabelActive,
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            ref={categoryInput}
            accessibilityLabel="Optional category"
            editable={!saving}
            value={category}
            onChangeText={setCategory}
            onFocus={() => setFocused('category')}
            onBlur={() => setFocused(null)}
            onSubmitEditing={() => notesInput.current?.focus()}
            placeholder="Or add your own category…"
            placeholderTextColor="#7A8579"
            maxLength={30}
            returnKeyType="next"
            style={[
              styles.input,
              focused === 'category' && styles.inputFocused,
            ]}
          />
        </Surface>

        <Surface style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionIcon}>
              <AppIcon name="note" size={20} />
            </View>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>A little more detail</Text>
              <Text style={styles.inputHint}>
                Notes, ideas, or a reminder for later.
              </Text>
            </View>
          </View>
          <TextInput
            ref={notesInput}
            accessibilityLabel="Optional notes"
            editable={!saving}
            value={notes}
            onChangeText={setNotes}
            onFocus={() => setFocused('notes')}
            onBlur={() => setFocused(null)}
            placeholder="Anything else on your mind?"
            placeholderTextColor="#7A8579"
            multiline
            scrollEnabled
            textAlignVertical="top"
            maxLength={500}
            style={[
              styles.input,
              styles.notesInput,
              focused === 'notes' && styles.inputFocused,
            ]}
          />
          <Text style={styles.notesCounter}>{notes.length}/500</Text>
        </Surface>

        <View style={styles.privacyNote}>
          <AppIcon name="shield" color={colors.textSecondary} size={16} />
          <Text style={styles.privacyText}>
            Only you can access your tasks.
          </Text>
        </View>
        {error ? (
          <TaskErrorBanner message={error} onDismiss={clearError} />
        ) : null}
        <PrimaryButton
          label={taskId ? 'Save changes' : 'Create task'}
          onPress={() => {
            save();
          }}
          loading={saving}
          style={styles.saveButton}
        />
        {taskId ? (
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={confirmDelete}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>Delete task</Text>
          </Pressable>
        ) : null}
      </KeyboardAwareScrollView>
      <DatePickerSheet
        visible={datePickerVisible}
        value={dueDate}
        onClose={() => setDatePickerVisible(false)}
        onSelect={date => {
          setDueDate(date);
          setErrors(current => ({ ...current, dueDate: undefined }));
          setDatePickerVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  header: {
    minHeight: 64,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.white,
    boxShadow: '3px 3px 7px rgba(115, 133, 107, 0.16), -3px -3px 7px #FFFFFF',
  },
  headerLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1.8,
    fontWeight: '700',
  },
  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  form: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  intro: { marginBottom: spacing.xxl, marginTop: spacing.xs },
  heading: {
    color: colors.textPrimary,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 6,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 25,
    boxShadow:
      '4px 4px 12px rgba(115, 133, 107, 0.12), -4px -4px 12px rgba(255, 255, 255, 0.8)',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  required: { color: colors.textSecondary, fontSize: 10 },
  optional: { color: colors.textSecondary, fontSize: 11 },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#E0E5D9',
    borderRadius: 16,
    backgroundColor: '#EDF0E6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 14,
    boxShadow:
      'inset 2px 2px 5px rgba(115, 133, 107, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.8)',
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: '#F0F5E9' },
  inputError: { borderColor: colors.danger },
  titleInput: {
    minHeight: 87,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    textAlignVertical: 'top',
  },
  fieldFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  inputHint: { color: colors.textSecondary, fontSize: 11, lineHeight: 17 },
  counter: { color: colors.textSecondary, fontSize: 10, paddingTop: 2 },
  errorText: {
    flexShrink: 1,
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCopy: { flex: 1 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  dateShortcuts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  dateChip: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  dateChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: '#CFDFC9',
  },
  dateChipLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  dateChipLabelActive: { color: colors.primary, fontWeight: '800' },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceMuted,
  },
  smallLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '700',
  },
  dateText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  fieldTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  timeField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 116,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 15,
    backgroundColor: colors.surfaceMuted,
    paddingLeft: spacing.md,
  },
  timeInput: {
    flex: 1,
    minHeight: 48,
    color: colors.textPrimary,
    fontSize: 13,
    paddingHorizontal: 0,
    paddingRight: spacing.md,
  },
  priorityRow: { flexDirection: 'row', gap: spacing.sm },
  priorityCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 92,
    padding: spacing.sm,
    borderRadius: 17,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: '#E1E7D9',
  },
  priorityCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    boxShadow: '2px 3px 7px rgba(6, 75, 32, 0.15)',
  },
  priorityBars: {
    flexDirection: 'row',
    height: 19,
    gap: 3,
    alignItems: 'flex-end',
    marginBottom: 7,
  },
  priorityBar: { width: 4, borderRadius: 2 },
  priorityBarMuted: { opacity: 0.2 },
  priorityLabel: { color: colors.textPrimary, fontSize: 12, fontWeight: '800' },
  priorityLabelSelected: { color: colors.white },
  priorityHint: { color: colors.textSecondary, fontSize: 9, marginTop: 4 },
  priorityHintSelected: { color: '#DAE9D6' },
  categoryChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  categoryChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  categoryChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: '#CFDFC9',
  },
  categoryLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  categoryLabelActive: { color: colors.primary, fontWeight: '800' },
  notesInput: { minHeight: 112, maxHeight: 160, lineHeight: 22 },
  notesCounter: {
    alignSelf: 'flex-end',
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 7,
  },
  privacyNote: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  privacyText: { color: colors.textSecondary, fontSize: 11 },
  saveButton: { minHeight: 56 },
  deleteButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  deleteText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  missing: {
    flex: 1,
    backgroundColor: colors.canvas,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  missingButton: { marginTop: spacing.xl },
});
