import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, FlatList, TouchableOpacity, StyleSheet, Alert, View, ActivityIndicator, I18nManager, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { moodDefinitions, activities, userMoods } from '../services/api';
import { colors, fonts, shadows } from '../utils/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Header from '../components/Header';

// Force RTL layout for Arabic text
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function MoodListScreen({ navigation }) {
  const { user } = useAuth();
  const [moodsList, setMoodsList] = useState([]);
  const [userMoodEntries, setUserMoodEntries] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchMoodData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // جلب تعريفات المزاج
      const moodsResponse = await moodDefinitions.getAll();
      setMoodsList(moodsResponse.data || []);
      
      // جلب الأنشطة
      const activitiesResponse = await activities.getAll();
      setActivitiesList(activitiesResponse.data || []);
      
      // جلب سجلات المزاج للمستخدم
      if (user && user._id) {
        const userMoodsResponse = await userMoods.getByUserId(user._id);
        
        if (userMoodsResponse.data && userMoodsResponse.data.length > 0) {
          // ترتيب السجلات حسب التاريخ (الأحدث أولاً)
          const sortedEntries = userMoodsResponse.data.sort((a, b) => {
            return new Date(b.createed_at || b.created_at || Date.now()) - 
                   new Date(a.createed_at || a.created_at || Date.now());
          });
          
          setUserMoodEntries(sortedEntries);
        } else {
          setUserMoodEntries([]);
        }
      }
    } catch (err) {
      console.error('Error fetching mood data:', err);
      setError('تعذر جلب بيانات الحالات المزاجية');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMoodData();
    
    // إعادة تحميل البيانات عند العودة إلى الشاشة
    const unsubscribe = navigation.addListener('focus', fetchMoodData);
    return unsubscribe;
  }, [navigation, user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMoodData();
  };

  const handleDelete = async (moodEntryId) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من رغبتك في حذف هذه الحالة المزاجية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await userMoods.delete(moodEntryId);
              fetchMoodData();
              Alert.alert('تم الحذف', 'تم حذف الحالة المزاجية بنجاح');
            } catch (err) {
              console.error('Error deleting mood entry:', err);
              Alert.alert('خطأ', 'تعذر حذف الحالة المزاجية');
              setLoading(false);
            }
          } 
        },
      ]
    );
  };

  const getMoodInfo = (moodId) => {
    const mood = moodsList.find(m => m._id === moodId);
    return mood ? {
      name: mood.name || 'حالة مزاجية',
      icon: mood.icon || 'happy-outline',
      color: mood.color || colors.primary
    } : {
      name: 'حالة مزاجية',
      icon: 'help-outline',
      color: colors.text
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return 'اليوم ' + date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return 'أمس ' + date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  // Get activity suggestions for a specific mood
  const getActivitySuggestions = (moodId) => {
    return activitiesList.filter(activity => {
      // Check if this activity is for this mood
      if (activity.mood_id && Array.isArray(activity.mood_id)) {
        return activity.mood_id.some(m => m._id === moodId);
      }
      return false;
    });
  };

  // Parse activities from string or array
  const parseActivities = (activitiesData) => {
    if (!activitiesData) return [];
    
    if (typeof activitiesData === 'string') {
      try {
        return activitiesData.split(',').map(id => id.trim());
      } catch (e) {
        return [];
      }
    }
    
    if (Array.isArray(activitiesData)) {
      return activitiesData;
    }
    
    return [];
  };

  const renderMoodItem = ({ item }) => {
    // Get mood ID from the item
    const moodId = item.mood_id && item.mood_id.length > 0 ? 
                   item.mood_id[0]._id : 
                   (typeof item.mood_id === 'string' ? item.mood_id : null);
    
    if (!moodId) return null;
    
    const moodInfo = getMoodInfo(moodId);
    const userActivities = parseActivities(item.activities);
    const moodActivities = getActivitySuggestions(moodId);
    
    // Filter activities to show only those selected by the user
    const selectedActivities = moodActivities.filter(activity => 
      userActivities.includes(activity._id)
    );
    
    return (
      <Card style={styles.moodCard}>
        <View style={styles.moodCardHeader}>
          <Text style={styles.dateText}>{formatDate(item.createed_at || item.created_at)}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('MoodEdit', { moodEntry: item })}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDelete(item._id)}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.moodContent}>
          <View style={[styles.moodIconContainer, { backgroundColor: moodInfo.color + '20' }]}>
            <Ionicons name={moodInfo.icon} size={32} color={moodInfo.color} />
          </View>
          <View style={styles.moodTextContainer}>
            <Text style={[styles.moodName, { color: moodInfo.color }]}>{moodInfo.name}</Text>
            {item.notes ? <Text style={styles.notesText}>{item.notes}</Text> : null}
          </View>
        </View>
        
        {selectedActivities.length > 0 && (
          <View style={styles.activitiesContainer}>
            <Text style={styles.activitiesTitle}>الأنشطة المختارة:</Text>
            {selectedActivities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <Ionicons name="checkmark-circle-outline" size={18} color={moodInfo.color} />
                <Text style={styles.activityText}>{activity.name}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color={colors.textLight} />
      <Text style={styles.emptyText}>لا توجد حالات مزاجية مسجلة</Text>
      <Text style={styles.emptySubText}>سجل حالتك المزاجية اليومية لتظهر هنا</Text>
      <Button 
        title="إضافة حالة جديدة" 
        onPress={() => navigation.navigate('MoodSelection')} 
        style={styles.addButton}
      />
    </View>
  );

  // إضافة حالة مزاجية جديدة
  const handleAddMood = () => {
    navigation.navigate('MoodSelection');
  };

  // إضافة نشاط جديد
  const handleAddActivity = () => {
    navigation.navigate('AddActivity');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="حالاتي المزاجية" />
      
      <View style={styles.actionButtonsContainer}>
        <Button 
          title="إضافة حالة مزاجية" 
          onPress={handleAddMood} 
          style={styles.actionButton}
          icon="add-circle-outline"
        />
        <Button 
          title="إضافة نشاط" 
          onPress={handleAddActivity} 
          style={styles.actionButton}
          icon="add-circle-outline"
        />
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="إعادة المحاولة" onPress={fetchMoodData} style={styles.retryButton} />
        </View>
      ) : (
        <FlatList
          data={userMoodEntries}
          keyExtractor={(item) => item._id}
          renderItem={renderMoodItem}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    direction: 'rtl'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.cardBackground,
    ...shadows.medium
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center'
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    minWidth: 150
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32
  },
  moodCard: {
    marginBottom: 16,
    padding: 16
  },
  moodCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  dateText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'right'
  },
  actionButtons: {
    flexDirection: 'row'
  },
  actionButton: {
    padding: 8,
    marginLeft: 8
  },
  moodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  moodIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12
  },
  moodTextContainer: {
    flex: 1
  },
  moodName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right',
    fontFamily: fonts.heading
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'right'
  },
  activitiesContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12
  },
  activitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
    color: colors.text,
    fontFamily: fonts.heading
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'flex-end'
  },
  activityText: {
    fontSize: 14,
    color: colors.text,
    marginRight: 8,
    textAlign: 'right'
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4
  },
  viewMoreText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: 16,
    textAlign: 'center',
    fontFamily: fonts.heading
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center'
  },
  addButton: {
    minWidth: 200
  }
});