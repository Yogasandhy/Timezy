import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = { size?: number; color?: string };

export function QuietStepsMark({ size = 38, color = colors.primary }: Props) {
  const unit = size / 256;
  const segment = (
    left: number,
    top: number,
    width: number,
    height: number,
  ) => ({
    position: 'absolute' as const,
    left: unit * left,
    top: unit * top,
    width: unit * width,
    height: unit * height,
    borderRadius: unit * 16,
    backgroundColor: color,
  });

  return (
    <View
      accessibilityLabel="Quiet Steps logo"
      accessible
      style={{ width: size, height: size }}
    >
      <View style={segment(32, 180, 72, 32)} />
      <View style={segment(72, 132, 32, 80)} />
      <View style={segment(72, 132, 72, 32)} />
      <View style={segment(112, 84, 32, 80)} />
      <View style={segment(112, 84, 72, 32)} />
      <View style={segment(152, 36, 32, 80)} />
      <View style={segment(152, 36, 72, 32)} />
    </View>
  );
}
