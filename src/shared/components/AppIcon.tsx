import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

export type AppIconName =
  | 'today'
  | 'calendar'
  | 'tasks'
  | 'profile'
  | 'back'
  | 'down'
  | 'check'
  | 'clock'
  | 'tag'
  | 'note'
  | 'logout'
  | 'shield'
  | 'plus'
  | 'arrow'
  | 'insights';

/** Small, consistent native icons; no font loading or additional native module. */
export function AppIcon({
  name,
  color = colors.primary,
  size = 24,
}: {
  name: AppIconName;
  color?: string;
  size?: number;
}) {
  const stroke = { borderColor: color };
  const ink = { backgroundColor: color };
  let shape: React.ReactNode;
  switch (name) {
    case 'today':
      shape = (
        <>
          <View style={[styles.sun, stroke]} />
          {[0, 45, 90, 135].map(angle => (
            <View
              key={angle}
              style={[
                styles.rayAxis,
                { transform: [{ rotate: `${angle}deg` }] },
              ]}
            >
              <View style={[styles.ray, ink]} />
              <View style={[styles.ray, ink]} />
            </View>
          ))}
        </>
      );
      break;
    case 'calendar':
      shape = (
        <>
          <View style={[styles.calendar, stroke]} />
          <View style={[styles.calendarRule, ink]} />
          <View style={[styles.calendarRing, styles.calendarRingLeft, ink]} />
          <View style={[styles.calendarRing, styles.calendarRingRight, ink]} />
          {[7, 12].map(left => (
            <View key={left} style={[styles.calendarDot, ink, { left }]} />
          ))}
        </>
      );
      break;
    case 'tasks':
      shape = (
        <>
          {[4, 11, 18].map(top => (
            <View key={top} style={[styles.taskLine, { top }]}>
              <View style={[styles.smallCheck, stroke]} />
              <View style={[styles.taskRule, ink]} />
            </View>
          ))}
        </>
      );
      break;
    case 'profile':
      shape = (
        <>
          <View style={[styles.head, stroke]} />
          <View style={[styles.shoulders, stroke]} />
        </>
      );
      break;
    case 'back':
    case 'down':
      shape = (
        <View
          style={[
            styles.chevron,
            stroke,
            { transform: [{ rotate: name === 'back' ? '45deg' : '-45deg' }] },
          ]}
        />
      );
      break;
    case 'check':
      shape = <View style={[styles.check, stroke]} />;
      break;
    case 'clock':
      shape = (
        <>
          <View style={[styles.clock, stroke]} />
          <View style={[styles.hourHand, ink]} />
          <View style={[styles.minuteHand, ink]} />
        </>
      );
      break;
    case 'tag':
      shape = (
        <>
          <View style={[styles.tag, stroke]} />
          <View style={[styles.tagHole, ink]} />
        </>
      );
      break;
    case 'note':
      shape = (
        <>
          <View style={[styles.note, stroke]} />
          {[8, 12, 16].map(top => (
            <View
              key={top}
              style={[
                styles.noteRule,
                ink,
                { top },
                top === 16 && styles.noteRuleShort,
              ]}
            />
          ))}
        </>
      );
      break;
    case 'logout':
      shape = (
        <>
          <View style={[styles.door, stroke]} />
          <View style={[styles.exitLine, ink]} />
          <View style={[styles.arrowTip, stroke]} />
        </>
      );
      break;
    case 'shield':
      shape = (
        <>
          <View style={[styles.shield, stroke]} />
          <View style={[styles.smallShieldCheck, stroke]} />
        </>
      );
      break;
    case 'plus':
      shape = (
        <>
          <View style={[styles.plusHorizontal, ink]} />
          <View style={[styles.plusVertical, ink]} />
        </>
      );
      break;
    case 'arrow':
      shape = (
        <>
          <View style={[styles.exitLine, styles.fullArrowLine, ink]} />
          <View style={[styles.arrowTip, stroke]} />
        </>
      );
      break;
    case 'insights':
      shape = (
        <>
          <View style={[styles.insightAxis, stroke]} />
          {[
            { left: 8, height: 5 },
            { left: 13, height: 10 },
            { left: 18, height: 15 },
          ].map(bar => (
            <View key={bar.left} style={[styles.insightBar, ink, bar]} />
          ))}
        </>
      );
      break;
  }
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size }}
    >
      <View style={[styles.canvas, { transform: [{ scale: size / 24 }] }]}>
        {shape}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    width: 24,
    height: 24,
    left: 0,
    top: 0,
    transformOrigin: 'top left',
  },
  sun: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderWidth: 1.8,
    borderRadius: 5,
    left: 7,
    top: 7,
  },
  rayAxis: {
    position: 'absolute',
    height: 24,
    width: 2,
    left: 11,
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  ray: { width: 2, height: 3, borderRadius: 1 },
  calendar: {
    position: 'absolute',
    left: 3,
    top: 5,
    width: 18,
    height: 17,
    borderWidth: 1.8,
    borderRadius: 4,
  },
  calendarRule: {
    position: 'absolute',
    top: 10,
    left: 4,
    width: 16,
    height: 1.8,
  },
  calendarRing: {
    position: 'absolute',
    top: 2,
    height: 6,
    width: 1.8,
    borderRadius: 1,
  },
  calendarRingLeft: { left: 7 },
  calendarRingRight: { right: 7 },
  calendarDot: {
    position: 'absolute',
    top: 14,
    height: 3,
    width: 3,
    borderRadius: 1,
  },
  taskLine: { position: 'absolute', left: 3, right: 3, height: 4 },
  smallCheck: {
    position: 'absolute',
    width: 5,
    height: 3,
    borderLeftWidth: 1.7,
    borderBottomWidth: 1.7,
    transform: [{ rotate: '-45deg' }],
  },
  taskRule: {
    position: 'absolute',
    left: 9,
    right: 0,
    top: 1,
    height: 1.8,
    borderRadius: 1,
  },
  head: {
    position: 'absolute',
    top: 2,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.8,
  },
  shoulders: {
    position: 'absolute',
    top: 13,
    left: 4,
    width: 16,
    height: 9,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    borderWidth: 1.8,
  },
  chevron: {
    position: 'absolute',
    width: 9,
    height: 9,
    left: 9,
    top: 7,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRadius: 1,
  },
  check: {
    position: 'absolute',
    left: 5,
    top: 6,
    width: 14,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '-45deg' }],
  },
  clock: {
    position: 'absolute',
    left: 3,
    top: 3,
    width: 18,
    height: 18,
    borderWidth: 1.8,
    borderRadius: 9,
  },
  hourHand: {
    position: 'absolute',
    left: 11,
    top: 6,
    width: 1.8,
    height: 7,
    borderRadius: 1,
  },
  minuteHand: {
    position: 'absolute',
    left: 11,
    top: 11,
    width: 6,
    height: 1.8,
    borderRadius: 1,
  },
  tag: {
    position: 'absolute',
    left: 5,
    top: 5,
    width: 15,
    height: 14,
    borderWidth: 1.8,
    borderTopLeftRadius: 6,
    borderRadius: 3,
    transform: [{ rotate: '-40deg' }],
  },
  tagHole: {
    position: 'absolute',
    left: 7,
    top: 8,
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  note: {
    position: 'absolute',
    left: 5,
    top: 2,
    width: 15,
    height: 20,
    borderWidth: 1.8,
    borderRadius: 3,
  },
  noteRule: {
    position: 'absolute',
    left: 8,
    height: 1.5,
    width: 8,
    borderRadius: 1,
  },
  noteRuleShort: { width: 5 },
  door: {
    position: 'absolute',
    left: 3,
    top: 3,
    width: 9,
    height: 18,
    borderTopWidth: 1.8,
    borderBottomWidth: 1.8,
    borderLeftWidth: 1.8,
    borderRadius: 2,
  },
  exitLine: {
    position: 'absolute',
    top: 11,
    left: 9,
    width: 12,
    height: 1.8,
    borderRadius: 1,
  },
  fullArrowLine: { left: 3, width: 16 },
  arrowTip: {
    position: 'absolute',
    top: 8,
    right: 3,
    width: 7,
    height: 7,
    borderTopWidth: 1.8,
    borderRightWidth: 1.8,
    transform: [{ rotate: '45deg' }],
  },
  shield: {
    position: 'absolute',
    left: 4,
    top: 2,
    width: 17,
    height: 21,
    borderWidth: 1.8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  smallShieldCheck: {
    position: 'absolute',
    left: 8,
    top: 9,
    width: 9,
    height: 5,
    borderBottomWidth: 1.7,
    borderLeftWidth: 1.7,
    transform: [{ rotate: '-45deg' }],
  },
  plusHorizontal: {
    position: 'absolute',
    top: 11,
    left: 5,
    width: 14,
    height: 2,
    borderRadius: 1,
  },
  plusVertical: {
    position: 'absolute',
    top: 5,
    left: 11,
    width: 2,
    height: 14,
    borderRadius: 1,
  },
  insightAxis: {
    position: 'absolute',
    left: 4,
    top: 3,
    width: 17,
    height: 18,
    borderLeftWidth: 1.8,
    borderBottomWidth: 1.8,
    borderBottomLeftRadius: 2,
  },
  insightBar: {
    position: 'absolute',
    bottom: 4,
    width: 3,
    borderRadius: 2,
  },
});
