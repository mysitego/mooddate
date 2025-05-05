import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { moodDefinitions, moodLogs, profiles, activities } from '../services/api';
import { colors, fonts, shadows } from '../utils/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Header from '../components/Header';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [todayMood, setTodayMood] = useState(null);
  const [moodsList, setMoodsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // جلب تعريفات المزاج
        const moodsResponse = await moodDefinitions.getAll();
        setMoodsList(moodsResponse.data);
        
        // جلب الملف الشخصي
        if (user && user._id) {
          const profileResponse = await profiles.getByUserId(user._id);
          if (profileResponse.data && profileResponse.data.length > 0) {
            setProfile(profileResponse.data[0]);
          } else {
            // إذا لم يكن هناك ملف شخصي، قم بإنشاء واحد
            console.log('No profile found, creating one...');
            try {
              const newProfile = {
                userid: [user._id],
                fullName: user.username,
                bio: '',
                avatarUrl: ''
              };
              const createResponse = await profiles.create(newProfile);
              setProfile(createResponse.data);
            } catch (profileError) {
              console.error('Error creating profile:', profileError);
            }
          }
          
          // التحقق من وجود مزاج لليوم
          const today = new Date().toISOString().split('T')[0];
          const logsResponse = await moodLogs.getByUserId(user._id);
          
          if (logsResponse.data && logsResponse.data.length > 0) {
            const todayLog = logsResponse.data.find(log => {
              const logDate = new Date(log.date).toISOString().split('T')[0];
              return logDate === today;
            });
            
            if (todayLog) {
              setTodayMood(todayLog);
            }
          }
        }
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // إعادة تحميل البيانات عند العودة إلى الشاشة
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  };

  const getMoodInfo = (moodId) => {
    const mood = moodsList.find(m => m.moodid === moodId);
    return mood ? {
      name: mood.moodname,
      icon: mood.icon || 'happy-outline',
      color: mood.color || colors.primary
    } : {
      name: '',
      icon: 'help-outline',
      color: colors.text
    };
  };

  const handleAddMood = () => {
    navigation.navigate('MoodSelection');
  };
  
  const handleEditMood = () => {
    if (todayMood) {
      navigation.navigate('MoodEdit', { moodLog: todayMood });
    }
  };

  const renderMoodStatus = () => {
    if (loading) {
      return (
        <Card style={styles.loadingCard}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
        </Card>
      );
    }
    
    if (todayMood) {
      const moodInfo = getMoodInfo(todayMood.moodid);
      
      return (
        <Card style={styles.moodCard}>
          <View style={styles.moodCardHeader}>
            <Text style={styles.cardTitle}>حالتك اليوم</Text>
            <TouchableOpacity onPress={handleEditMood}>
              <Ionicons name="pencil-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.moodInfo}>
            <View style={[styles.moodIconContainer, { backgroundColor: moodInfo.color + '20' }]}>
              <Ionicons 
                name={moodInfo.icon} 
                size={48} 
                color={moodInfo.color} 
              />
            </View>
            <View style={styles.moodTextContainer}>
              <Text style={[styles.moodName, { color: moodInfo.color }]}>{moodInfo.name}</Text>
              {todayMood.notes ? (
                <Text style={styles.moodNotes}>{todayMood.notes}</Text>
              ) : null}
            </View>
          </View>
          <TouchableOpacity 
            style={styles.viewSuggestionsButton}
            onPress={() => navigation.navigate('ActivitySuggestion', { mood: todayMood.moodid })}
          >
            <Text style={styles.viewSuggestionsText}>عرض الاقتراحات</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </Card>
      );
    }
    
    return (
      <Card style={styles.addMoodCard}>
        <Text style={styles.cardTitle}>كيف تشعر اليوم؟</Text>
        <Text style={styles.addMoodText}>لم تسجل حالتك المزاجية لهذا اليوم</Text>
        <Button 
          title="إضافة حالة جديدة" 
          onPress={handleAddMood} 
          style={styles.addMoodButton}
        />
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="الرئيسية" 
        rightIcon="notifications-outline" 
        onRightPress={() => {}} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            {getGreeting()}{profile ? `, ${profile.fullName}` : ''}
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('ar-EG', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        {renderMoodStatus()}
        
        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>إحصائيات الحالة</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>الأسبوع</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>الشهر</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statLabel}>المجموع</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('MoodList')}
          >
            <Text style={styles.viewAllText}>عرض جميع الحالات</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  greeting: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: fonts.title,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  dateText: {
    fontSize: fonts.body,
    color: colors.textLight,
  },
  loadingCard: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    fontSize: fonts.body,
    color: colors.textLight,
    marginTop: 15,
  },
  moodCard: {
    marginBottom: 20,
  },
  moodCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addMoodCard: {
    marginBottom: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: fonts.subtitle,
    fontWeight: 'bold',
    color: colors.text,
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  moodIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.lightBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  moodTextContainer: {
    flex: 1,
  },
  moodName: {
    fontSize: fonts.subtitle,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  moodNotes: {
    fontSize: fonts.body,
    color: colors.textLight,
  },
  viewSuggestionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lightBg,
  },
  viewSuggestionsText: {
    fontSize: fonts.body,
    color: colors.primary,
    marginRight: 5,
  },
  addMoodText: {
    fontSize: fonts.body,
    color: colors.textLight,
    marginVertical: 15,
    textAlign: 'center',
  },
  addMoodButton: {
    width: '100%',
  },
  statsCard: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: colors.lightBg,
    borderRadius: 10,
    padding: 15,
    width: '30%',
  },
  statValue: {
    fontSize: fonts.title,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: fonts.caption,
    color: colors.textLight,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewAllText: {
    fontSize: fonts.body,
    color: colors.primary,
    marginRight: 4,
  },
});

export default HomeScreen;
