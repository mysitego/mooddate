import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, Alert, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors, fonts, shadows } from '../utils/theme';
import Button from '../components/Button';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, loading, error } = useAuth();

  const handleRegister = async () => {
    // التحقق من صحة المدخلات
    if (!username || !password || !email) {
      Alert.alert('خطأ', 'يرجى إدخال جميع الحقول المطلوبة');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمة المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      Alert.alert('خطأ', 'يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }

    try {
      console.log('Attempting registration with:', username, email);
      await signUp(username, email, password);
      console.log('Registration successful');
      Alert.alert('نجاح', 'تم إنشاء الحساب بنجاح');
      // سيتم التوجيه تلقائيًا من خلال سياق المصادقة
    } catch (error) {
      console.log('Registration error:', error.message);
      
      // Show specific error message based on the error
      if (error.message.includes('اسم المستخدم مستخدم بالفعل')) {
        Alert.alert('خطأ', 'اسم المستخدم مستخدم بالفعل');
      } else if (error.message.includes('البريد الإلكتروني مستخدم بالفعل')) {
        Alert.alert('خطأ', 'البريد الإلكتروني مستخدم بالفعل');
      } else {
        Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء الحساب');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>مودميت</Text>
            <Text style={styles.subtitle}>إنشاء حساب جديد</Text>
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
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <TextInput
                style={styles.input}
                placeholder="أدخل البريد الإلكتروني"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
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
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>تأكيد كلمة المرور</Text>
              <TextInput
                style={styles.input}
                placeholder="أعد إدخال كلمة المرور"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <Button 
              title={loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              onPress={handleRegister}
              disabled={loading}
              loading={loading}
              style={styles.registerButton}
            />
            
            <TouchableOpacity 
              style={styles.loginLink} 
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.link}>لديك حساب بالفعل؟ تسجيل الدخول</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
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
    marginBottom: 20,
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
  registerButton: {
    marginTop: 10,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: { 
    color: colors.primary, 
    fontSize: 16, 
    textAlign: 'center',
  }
});
