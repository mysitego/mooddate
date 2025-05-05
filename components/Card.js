import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, shadows } from '../utils/theme';

/**
 * مكون البطاقة لعرض المحتوى في التطبيق
 */
const Card = ({ children, style, flat = false }) => {
  return (
    <View style={[styles.card, !flat && shadows.small, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    padding: 16,
    marginVertical: 8,
  }
});

export default Card;
