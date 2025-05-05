import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors, fonts } from '../utils/theme';

const SplashScreen = ({ navigation }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    // التحقق من حالة المستخدم بعد تحميل البيانات
    if (!loading) {
      // التوجيه إلى الشاشة المناسبة بعد 1.5 ثانية
      const timer = setTimeout(() => {
        if (user) {
          navigation.replace('AppStack');
        } else {
          navigation.replace('Login');
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [loading, user, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* يمكن استبدال هذا بشعار التطبيق */}
        <Text style={styles.title}>مودميت</Text>
        <Text style={styles.subtitle}>تتبع حالتك المزاجية</Text>
        <ActivityIndicator 
          size="large" 
          color={colors.primary} 
          style={styles.loader} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fonts.subtitle,
    color: colors.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
