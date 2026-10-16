import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = { size?: number; color?: string };

export function QuietStepsMark({ size = 38, color = colors.primary }: Props) {
  const unit = size / 8;
  const thickness = unit * 1.45;
  const segment = (left: number, top: number, width: number, height: number) => ({
    position: 'absolute' as const,
    left: unit * left,
    top: unit * top,
    width: unit * width,
    height: unit * height,
    borderRadius: thickness / 2,
    backgroundColor: color,
  });

  return (
    <View accessibilityLabel="Quiet Steps logo" accessible style={{ width: size, height: size }}>
      <View style={segment(0.5, 5.55, 3.0, 1.45)} />
      <View style={segment(2.15, 3.9, 1.45, 3.1)} />
      <View style={segment(2.15, 3.9, 3.0, 1.45)} />
      <View style={segment(3.8, 2.25, 1.45, 3.1)} />
      <View style={segment(3.8, 2.25, 3.0, 1.45)} />
      <View style={segment(5.45, 0.6, 1.45, 3.1)} />
    </View>
  );
}
