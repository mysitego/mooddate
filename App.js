import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Navigation
import AuthStack from './navigation/AuthStack';
import AppStack from './navigation/AppStack';

// Theme
import { colors } from './utils/theme';

// مكون التنقل الرئيسي مع التحقق من حالة المصادقة
const RootNavigator = () => {
  const { user, loading } = useAuth();
  
  // إذا كان التحميل جارٍ، يمكن عرض شاشة تحميل هنا
  if (loading) {
    return null;
  }
  
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

// المكون الرئيسي للتطبيق
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cardBg} />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  }
});
