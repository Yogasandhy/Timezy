import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getLocalDateKey,
  parseLocalDateKey,
  shiftDateKey,
} from '../../features/tasks/domain/task';
import { colors, radii, spacing } from '../theme/tokens';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  visible: boolean;
  value: string;
  onClose: () => void;
  onSelect: (date: string) => void;
};

export function DatePickerSheet({ visible, value, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const selected = parseLocalDateKey(value);
  const selectedYear = selected.getFullYear();
  const selectedMonth = selected.getMonth();
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(selectedYear, selectedMonth, 1, 12),
  );
  useEffect(() => {
    setVisibleMonth(new Date(selectedYear, selectedMonth, 1, 12));
  }, [selectedYear, selectedMonth]);
  const first = visibleMonth;
  const firstKey = getLocalDateKey(first);
  const leading = first.getDay();
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();
  const cells = [
    ...Array(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const monthLabel = first.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const today = getLocalDateKey();

  const navigateMonth = (offset: number) => {
    setVisibleMonth(
      current =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1, 12),
    );
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close date picker"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View
          style={[styles.sheet, { paddingBottom: spacing.xl + insets.bottom }]}
        >
          <View style={styles.titleRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={() => navigateMonth(-1)}
              style={styles.monthButton}
            >
              <Text style={styles.monthArrow}>‹</Text>
            </Pressable>
            <Text style={styles.month}>{monthLabel}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              onPress={() => navigateMonth(1)}
              style={styles.monthButton}
            >
              <Text style={styles.monthArrow}>›</Text>
            </Pressable>
          </View>
          <View style={styles.grid}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text key={`${day}-${index}`} style={styles.weekday}>
                {day}
              </Text>
            ))}
            {cells.map((day, index) => {
              if (!day)
                return <View key={`blank-${index}`} style={styles.dayCell} />;
              const date = shiftDateKey(firstKey, day - 1);
              const isSelected = date === value;
              return (
                <Pressable
                  key={date}
                  accessibilityRole="button"
                  accessibilityLabel={parseLocalDateKey(
                    date,
                  ).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onSelect(date)}
                  style={[
                    styles.dayCell,
                    isSelected && styles.daySelected,
                    date === today && !isSelected && styles.dayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <PrimaryButton label="Done" onPress={onClose} style={styles.done} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 35, 24, 0.28)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.canvas,
    padding: spacing.xl,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  month: { fontSize: 18, color: colors.textPrimary, fontWeight: '800' },
  monthButton: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthArrow: { color: colors.primary, fontSize: 30, lineHeight: 34 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: {
    width: '14.2857%',
    height: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.textSecondary,
    fontWeight: '700',
  },
  dayCell: {
    width: '14.2857%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  daySelected: { backgroundColor: colors.primary },
  dayToday: { borderWidth: 1, borderColor: colors.primary },
  dayText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  dayTextSelected: { color: colors.white },
  done: { marginTop: spacing.lg },
});
