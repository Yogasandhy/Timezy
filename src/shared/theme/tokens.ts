export const colors = {
  canvas: '#F2F4EA',
  surface: '#F8F9F3',
  surfaceMuted: '#E9EDE2',
  primary: '#064B20',
  primarySoft: '#DDE9DA',
  textPrimary: '#18231B',
  textSecondary: '#626C63',
  outline: '#D5DCCF',
  danger: '#A52E32',
  white: '#FFFFFF',
  low: '#8D7046',
  normal: '#54735A',
  high: '#A52E32',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = { sm: 12, md: 18, lg: 24, pill: 999 } as const;

export const shadows = {
  raised: {
    shadowColor: '#AEB7A7',
    shadowOffset: { width: 4, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: {
    shadowColor: '#AEB7A7',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 3,
    elevation: 1,
  },
} as const;
