// تعريف الألوان والخطوط الموحدة للتطبيق
export const colors = {
  background: '#f8f8f8',
  cardBg: '#fff',
  primary: '#007aff',
  secondary: '#5ac8fa',
  success: '#4cd964',
  danger: '#ff3b30',
  warning: '#ffcc00',
  text: '#333',
  muted: '#666',
  light: '#e5e5e5',
  dark: '#1c1c1e',
  shadow: 'rgba(0, 0, 0, 0.1)'
};

export const fonts = {
  title: 24,
  subtitle: 20,
  body: 16,
  small: 14,
  tiny: 12
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

export const radius = {
  sm: 4,
  md: 10,
  lg: 20,
  round: 999
};

export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4
  }
};
