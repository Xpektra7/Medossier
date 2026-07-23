export const colors = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  secondary: '#059669',
  danger: '#DC2626',
  warning: '#D97706',
  info: '#0284C7',

  background: '#FFFFFF',
  surface: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E7EB',

  text: '#111827',
  textSecondary: '#6B7280',
  textInverse: '#FFFFFF',

  severityContraindicated: '#DC2626',
  severityModerate: '#D97706',
  severityMinor: '#6B7280',
} as const

export type ColorKey = keyof typeof colors