import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, fonts } from '../utils/theme';

/**
 * زر موحد قابل للتخصيص للتطبيق
 */
const Button = ({ 
  title, 
  onPress, 
  type = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle
}) => {
  // تحديد نمط الزر بناءً على النوع
  const getButtonStyle = () => {
    switch (type) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'danger':
        return styles.dangerButton;
      case 'transparent':
        return styles.transparentButton;
      default:
        return styles.primaryButton;
    }
  };

  // تحديد نمط النص بناءً على النوع
  const getTextStyle = () => {
    switch (type) {
      case 'outline':
      case 'transparent':
        return styles.outlineText;
      case 'secondary':
        return styles.secondaryText;
      case 'danger':
        return styles.dangerText;
      default:
        return styles.primaryText;
    }
  };

  // تحديد حجم الزر
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        disabled && styles.disabledButton,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={type === 'outline' ? colors.primary : colors.cardBg} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  transparentButton: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    opacity: 0.6,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryText: {
    color: colors.cardBg,
    fontSize: fonts.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryText: {
    color: colors.cardBg,
    fontSize: fonts.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  outlineText: {
    color: colors.primary,
    fontSize: fonts.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  dangerText: {
    color: colors.cardBg,
    fontSize: fonts.body,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Button;
