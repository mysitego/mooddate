import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { profiles, userMoods, moodDefinitions } from '../services/api';
import { colors, fonts, shadows } from '../utils/theme';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';

const ProfileScreen = ({ navigation }) => {
  const { user, signOut, loading: authLoading, refreshUserData } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userStats, setUserStats] = useState({
    totalMoods: 0,
    moodCounts: {}
  });
  const [loading, setLoading] = useState(true);

  // تحميل بيانات الملف الشخصي
  useEffect(() => {
    const loadProfile = async () => {
      if (!user || !user._id) return;
      
      try {
        setLoading(true);
        const response = await profiles.getByUserId(user._id);
        
        if (response.data && response.data.length > 0) {
          setProfile(response.data[0]);
        }

        // تحديث بيانات المستخدم من قاعدة البيانات
        await refreshUserData();
      } catch (error) {
        console.error('Error loading profile:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء تحميل الملف الشخصي');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
    
    // إعادة تحميل البيانات عند العودة إلى الشاشة
    const unsubscribe = navigation.addListener('focus', loadProfile);
    return unsubscribe;
  }, [navigation, user, refreshUserData]);

  // تحميل إحصائيات المستخدم
  useEffect(() => {
    const loadUserStats = async () => {
      if (!user || !user._id) return;
      
      try {
        // جلب حالات المستخدم المزاجية
        const userMoodsResponse = await userMoods.getByUserId(user._id);
        
        if (userMoodsResponse.data && userMoodsResponse.data.length > 0) {
          const moods = userMoodsResponse.data;
          const totalMoods = moods.length;
          
          // جلب تعريفات الحالات المزاجية
          const moodDefsResponse = await moodDefinitions.getAll();
          const moodDefs = moodDefsResponse.data || [];
          
          // إحصاء الحالات المزاجية
          const moodCounts = {};
          
          moods.forEach(mood => {
            // الحصول على معرف الحالة المزاجية
            const moodId = mood.mood_id && mood.mood_id.length > 0 ? 
                          mood.mood_id[0]._id : 
                          (typeof mood.mood_id === 'string' ? mood.mood_id : null);
            
            if (moodId) {
              if (moodCounts[moodId]) {
                moodCounts[moodId].count++;
              } else {
                const moodDef = moodDefs.find(m => m._id === moodId);
                moodCounts[moodId] = {
                  name: moodDef ? moodDef.name : 'حالة مزاجية',
                  count: 1
                };
              }
            }
          });
          
          setUserStats({
            totalMoods,
            moodCounts
          });
        }
      } catch (error) {
        console.error('Error loading user stats:', error);
      }
    };
    
    loadUserStats();
  }, [user]);

  // تسجيل الخروج
  const handleLogout = async () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'تسجيل الخروج', 
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };

  // تعديل الملف الشخصي
  const handleEditProfile = () => {
    // سيتم تنفيذ هذه الوظيفة لاحقاً
    Alert.alert('قريباً', 'ستتمكن من تعديل ملفك الشخصي قريباً');
  };

  // عرض شاشة التحميل
  if (loading || authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="الملف الشخصي" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // الحصول على أكثر حالتين مزاجيتين تكراراً
  const getTopMoods = () => {
    const moodEntries = Object.entries(userStats.moodCounts);
    return moodEntries
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 2)
      .map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count
      }));
  };

  const topMoods = getTopMoods();

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="الملف الشخصي" 
        rightIcon="settings-outline" 
        onRightPress={handleEditProfile} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profile && profile.avatarUrl ? (
              <Image 
                source={{ uri: profile.avatarUrl }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color={colors.light} />
              </View>
            )}
          </View>
          
          <Text style={styles.username}>
            {profile ? profile.fullName : user ? user.username : 'المستخدم'}
          </Text>
          
          <Text style={styles.email}>
            {user ? user.email : ''}
          </Text>
          
          <Button 
            title="تعديل الملف الشخصي" 
            onPress={handleEditProfile}
            type="outline"
            style={styles.editButton}
          />
        </View>
        
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>معلومات الحساب</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>اسم المستخدم</Text>
            <Text style={styles.infoValue}>{user ? user.username : '-'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>البريد الإلكتروني</Text>
            <Text style={styles.infoValue}>{user ? user.email : '-'}</Text>
          </View>
          
          {profile && profile.bio ? (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>نبذة</Text>
              <Text style={styles.infoValue}>{profile.bio}</Text>
            </View>
          ) : null}
        </Card>
        
        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>إحصائيات</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.totalMoods}</Text>
              <Text style={styles.statLabel}>حالة</Text>
            </View>
            
            {topMoods.map((mood, index) => (
              <View key={mood.id} style={styles.statItem}>
                <Text style={styles.statValue}>{mood.count}</Text>
                <Text style={styles.statLabel}>{mood.name}</Text>
              </View>
            ))}
            
            {topMoods.length === 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>حالات مسجلة</Text>
              </View>
            )}
          </View>
        </Card>
        
        <Button 
          title="تسجيل الخروج" 
          onPress={handleLogout}
          type="danger"
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: fonts.title,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: fonts.body,
    color: colors.muted,
    marginBottom: 16,
  },
  editButton: {
    width: 200,
  },
  infoCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: fonts.subtitle,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: fonts.small,
    color: colors.muted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: fonts.body,
    color: colors.text,
  },
  statsCard: {
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: fonts.small,
    color: colors.muted,
  },
  logoutButton: {
    marginBottom: 30,
  },
});

export default ProfileScreen;
