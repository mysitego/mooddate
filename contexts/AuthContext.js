import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, auth, profiles } from '../services/api';

// إنشاء سياق المصادقة
const AuthContext = createContext();

// مزود سياق المصادقة
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // التحقق من وجود مستخدم مسجل عند بدء التطبيق
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load user from storage:', e);
      } finally {
        setLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  // تسجيل الدخول
  const signIn = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user by username
      const response = await auth.login(username);
      
      if (response.data && response.data.length > 0) {
        const userData = response.data[0];
        
        // Check password separately to avoid exposing passwords in URL
        if (userData.password === password) {
          console.log('Login successful:', userData);
          
          // Store user data in AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          await AsyncStorage.setItem('userId', userData._id);
          
          // Update user state
          setUser(userData);
          return userData;
        } else {
          console.log('Password incorrect');
          throw new Error('كلمة المرور غير صحيحة');
        }
      } else {
        console.log('Username not found');
        throw new Error('اسم المستخدم غير موجود');
      }
    } catch (e) {
      console.error('Login error:', e);
      setError(e.message || 'حدث خطأ أثناء تسجيل الدخول');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // إنشاء حساب جديد
  const signUp = async (username, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // التحقق من عدم وجود مستخدم بنفس الاسم أو البريد
      const checkUser = await auth.checkUsername(username);
      const checkEmail = await auth.checkEmail(email);
      
      if (checkUser.data && checkUser.data.length > 0) {
        throw new Error('اسم المستخدم مستخدم بالفعل');
      }
      
      if (checkEmail.data && checkEmail.data.length > 0) {
        throw new Error('البريد الإلكتروني مستخدم بالفعل');
      }
      
      // إنشاء المستخدم
      const userData = {
        username, 
        email, 
        password,
        active: true
      };
      
      const response = await auth.register(userData);
      const createdUser = response.data;
      
      // إنشاء ملف تعريف فارغ للمستخدم
      const profileData = {
        userid: [{ _id: createdUser._id }],
        fullName: username,
        bio: '',
        avatarUrl: ''
      };
      
      await profiles.create(profileData);
      
      // تخزين بيانات المستخدم
      await AsyncStorage.setItem('user', JSON.stringify(createdUser));
      await AsyncStorage.setItem('userId', createdUser._id);
      setUser(createdUser);
      return createdUser;
    } catch (e) {
      console.error('Signup error:', e);
      setError(e.message || 'حدث خطأ أثناء إنشاء الحساب');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الخروج
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userId');
      setUser(null);
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  // تحديث بيانات المستخدم
  const updateUser = async (userData) => {
    try {
      setLoading(true);
      // تحديث بيانات المستخدم في قاعدة البيانات
      if (user && user._id) {
        await auth.updateUser(user._id, userData);
      }
      const updatedUser = { ...user, ...userData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (e) {
      console.error('Error updating user:', e);
    } finally {
      setLoading(false);
    }
  };

  // جلب بيانات المستخدم المحدثة من قاعدة البيانات
  const refreshUserData = async () => {
    try {
      if (user && user._id) {
        const response = await auth.getUserById(user._id);
        if (response.data) {
          const updatedUser = response.data;
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      }
    } catch (e) {
      console.error('Error refreshing user data:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        updateUser,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook لاستخدام سياق المصادقة
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
