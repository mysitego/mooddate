import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, Alert, View, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors, fonts, shadows } from '../utils/theme';
import Button from '../components/Button';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    
    try {
      console.log('Attempting login with:', username);
      await signIn(username, password);
      console.log('Login successful');
      // سيتم التوجيه تلقائيًا من خلال سياق المصادقة
    } catch (error) {
      console.log('Login error:', error.message);
      
      // Show specific error message based on the error
      if (error.message.includes('اسم المستخدم غير موجود')) {
        Alert.alert('خطأ', 'اسم المستخدم غير موجود');
      } else if (error.message.includes('كلمة المرور غير صحيحة')) {
        Alert.alert('خطأ', 'كلمة المرور غير صحيحة');
      } else {
        Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الدخول');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>مودميت</Text>
          <Text style={styles.subtitle}>تسجيل الدخول</Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>اسم المستخدم</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل اسم المستخدم"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>كلمة المرور</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل كلمة المرور"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <Button 
            title={loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            onPress={handleLogin}
            disabled={loading}
            loading={loading}
            style={styles.loginButton}
          />
          
          <TouchableOpacity 
            style={styles.registerLink} 
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.link}>ليس لديك حساب؟ إنشاء حساب جديد</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    color: colors.primary, 
    textAlign: 'center', 
    marginBottom: 10,
  },
  subtitle: {
    fontSize: fonts.subtitle,
    color: colors.text,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.cardBg,
    borderRadius: 15,
    padding: 20,
    ...shadows.medium,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: fonts.body,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: { 
    backgroundColor: colors.background, 
    borderRadius: 10, 
    padding: 15, 
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.light,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 10,
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: { 
    color: colors.primary, 
    fontSize: 16, 
    textAlign: 'center',
  }
});
