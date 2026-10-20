import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TabScreenProps } from '../../../app/navigation/types';
import { EmptyState } from '../../../shared/components/EmptyState';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScreenBrand } from '../../../shared/components/ScreenBrand';
import { ScreenLayout } from '../../../shared/components/ScreenLayout';
import { Surface } from '../../../shared/components/Surface';
import { TaskErrorBanner } from '../../../shared/components/TaskErrorBanner';
import { TaskRow } from '../../../shared/components/TaskRow';
import { colors, radii, spacing } from '../../../shared/theme/tokens';
import { getWeeklyInsights } from '../domain/insights';
import { parseLocalDateKey } from '../domain/task';
import { useTasks } from '../state/TaskContext';

export function InsightsScreen({ navigation }: TabScreenProps<'Insights'>) {
  const { tasks, error, clearError, setTaskCompleted } = useTasks();
  const insights = useMemo(() => getWeeklyInsights(tasks), [tasks]);
  const weekLabel = `${parseLocalDateKey(insights.startDate).toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric' },
  )} – ${parseLocalDateKey(insights.endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;
  const maxDailyTasks = Math.max(1, ...insights.days.map(day => day.total));
  const openTask = (taskId: string) =>
    navigation.navigate('TaskForm', { taskId });
  const addTask = () => navigation.navigate('TaskForm');

  return (
    <ScreenLayout>
      <ScreenBrand
        eyebrow="A CLEARER VIEW OF YOUR WEEK"
        title="Your progress"
      />
      {error ? (
        <TaskErrorBanner message={error} onDismiss={clearError} />
      ) : null}

      <Surface style={styles.hero}>
        <View style={styles.heroHeading}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>THIS WEEK’S PLAN</Text>
            <Text style={styles.heroTitle}>{weekLabel}</Text>
            <Text style={styles.heroSubtitle}>
              Small steps add up. Keep your own pace.
            </Text>
          </View>
          <View
            accessibilityLabel={`${insights.progress}% complete`}
            style={styles.progressBadge}
          >
            <Text style={styles.progressNumber}>{insights.progress}%</Text>
            <Text style={styles.progressCaption}>done</Text>
          </View>
        </View>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Weekly task progress"
          accessibilityValue={{ min: 0, max: 100, now: insights.progress }}
          style={styles.progressTrack}
        >
          <View
            style={[styles.progressFill, { width: `${insights.progress}%` }]}
          />
        </View>
        <View style={styles.summaryRow}>
          <SummaryValue value={insights.total} label="Planned" />
          <View style={styles.divider} />
          <SummaryValue value={insights.completed} label="Done" />
          <View style={styles.divider} />
          <SummaryValue value={insights.remaining} label="To go" />
        </View>
      </Surface>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Your week, day by day</Text>
          <Text style={styles.sectionSubtitle}>
            Tasks completed from this week’s plan
          </Text>
        </View>
      </View>
      <Surface style={styles.chartCard}>
        {insights.total === 0 ? (
          <Text style={styles.emptyChart}>
            Your weekly rhythm will show up here as you plan.
          </Text>
        ) : (
          <View style={styles.chart}>
            {insights.days.map(day => {
              const height =
                day.total === 0
                  ? 0
                  : Math.max(8, (day.total / maxDailyTasks) * 88);
              const completedHeight =
                day.total === 0 ? 0 : height * (day.completed / day.total);
              return (
                <View key={day.date} style={styles.chartDay}>
                  <Text
                    accessibilityLabel={`${day.completed} of ${day.total} tasks`}
                    style={styles.chartCount}
                  >
                    {day.total === 0 ? '·' : `${day.completed}/${day.total}`}
                  </Text>
                  <View style={styles.chartTrack}>
                    {height > 0 ? (
                      <View style={[styles.plannedBar, { height }]} />
                    ) : null}
                    {completedHeight > 0 ? (
                      <View
                        style={[
                          styles.completedBar,
                          { height: completedHeight },
                        ]}
                      />
                    ) : null}
                  </View>
                  <Text style={styles.chartLabel}>{day.label}</Text>
                </View>
              );
            })}
          </View>
        )}
        <View style={styles.legend}>
          <Legend color="#C5D8BE" label="Planned" />
          <Legend color={colors.primary} label="Completed" />
        </View>
      </Surface>

      <View style={styles.metricsRow}>
        <MetricCard
          label="Overdue"
          value={insights.overdue}
          detail="Need a new date"
          tone="warm"
        />
        <MetricCard
          label="High priority"
          value={insights.highPriorityOpen}
          detail="Still to do"
          tone="green"
        />
      </View>

      {insights.overdueTasks.length > 0 ? (
        <>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionTitle}>Needs a little attention</Text>
              <Text style={styles.sectionSubtitle}>
                Reschedule these or mark them done
              </Text>
            </View>
          </View>
          {insights.overdueTasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              onPress={() => openTask(task.id)}
              onToggle={() =>
                setTaskCompleted(task.id, true).catch(() => undefined)
              }
            />
          ))}
        </>
      ) : null}

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Where your time goes</Text>
          <Text style={styles.sectionSubtitle}>By category · this week</Text>
        </View>
      </View>
      <Surface style={styles.categoryCard}>
        {insights.categories.length === 0 ? (
          <Text style={styles.emptyChart}>
            Add a category to see how your week is balanced.
          </Text>
        ) : (
          insights.categories.map(category => (
            <View key={category.name} style={styles.categoryRow}>
              <View style={styles.categoryTopline}>
                <Text numberOfLines={1} style={styles.categoryName}>
                  {category.name}
                </Text>
                <Text style={styles.categoryCount}>
                  {category.completed}/{category.total} done
                </Text>
              </View>
              <View style={styles.categoryTrack}>
                <View
                  style={[
                    styles.categoryFill,
                    {
                      width: `${Math.round(
                        (category.total / insights.total) * 100,
                      )}%`,
                    },
                  ]}
                />
                {category.completed > 0 ? (
                  <View
                    style={[
                      styles.categoryCompleted,
                      {
                        width: `${Math.round(
                          (category.completed / insights.total) * 100,
                        )}%`,
                      },
                    ]}
                  />
                ) : null}
              </View>
            </View>
          ))
        )}
      </Surface>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Up next</Text>
          <Text style={styles.sectionSubtitle}>
            A little nudge for what’s ahead
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Tasks')}
          style={styles.viewAll}
        >
          <Text style={styles.viewAllText}>All tasks</Text>
        </Pressable>
      </View>
      {insights.nextTasks.length === 0 ? (
        <Surface style={styles.emptyCard}>
          <EmptyState
            title="Nothing waiting on you"
            body="Enjoy the breathing room or plan your next step."
          />
        </Surface>
      ) : (
        insights.nextTasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            onPress={() => openTask(task.id)}
            onToggle={() =>
              setTaskCompleted(task.id, true).catch(() => undefined)
            }
          />
        ))
      )}

      {tasks.length === 0 ? (
        <PrimaryButton
          label="＋   Add your first task"
          onPress={addTask}
          style={styles.addButton}
        />
      ) : null}
    </ScreenLayout>
  );
}

function SummaryValue({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.summaryValue}>
      <Text style={styles.summaryNumber}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: 'warm' | 'green';
}) {
  return (
    <Surface
      style={[
        styles.metricCard,
        tone === 'warm' ? styles.metricWarm : styles.metricGreen,
      ]}
    >
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </Surface>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    backgroundColor: '#EEF2E8',
    borderColor: '#FFFFFF',
  },
  heroHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroCopy: { flex: 1 },
  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '800',
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  progressBadge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: { color: colors.white, fontSize: 16, fontWeight: '800' },
  progressCaption: { color: '#DCE8D9', fontSize: 10, marginTop: 1 },
  progressTrack: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: '#D4DED0',
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
  },
  summaryValue: { alignItems: 'center', minWidth: 58 },
  summaryNumber: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  summaryLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  divider: { width: 1, height: 25, backgroundColor: colors.outline },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 19, fontWeight: '800' },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  chartCard: { padding: spacing.lg, marginBottom: spacing.xxl },
  chart: {
    height: 127,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  chartDay: { flex: 1, alignItems: 'center', gap: spacing.xs },
  chartCount: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    height: 14,
  },
  chartTrack: {
    height: 88,
    width: '72%',
    maxWidth: 27,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  plannedBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: radii.pill,
    backgroundColor: '#C5D8BE',
  },
  completedBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  chartLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  emptyChart: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    paddingVertical: spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textSecondary, fontSize: 11 },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  metricCard: { flex: 1, minHeight: 112, padding: spacing.lg },
  metricWarm: { backgroundColor: '#F5EEE4', borderColor: '#FFFFFF' },
  metricGreen: { backgroundColor: '#E8EFE5', borderColor: '#FFFFFF' },
  metricLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  metricDetail: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  categoryCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xxl,
  },
  categoryRow: { paddingVertical: spacing.md },
  categoryTopline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  categoryName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryCount: { color: colors.textSecondary, fontSize: 11 },
  categoryTrack: {
    height: 7,
    borderRadius: radii.pill,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  categoryFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: radii.pill,
    backgroundColor: '#C5D8BE',
  },
  categoryCompleted: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  viewAll: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  viewAllText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  emptyCard: { padding: 0, marginBottom: spacing.md },
  addButton: { marginTop: spacing.md },
});
