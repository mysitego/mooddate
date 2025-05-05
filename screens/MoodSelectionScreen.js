import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, Alert, View, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moodDefinitions, userMoods, activities } from '../services/api';
import { colors, fonts, shadows } from '../utils/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Header from '../components/Header';

export default function MoodSelectionScreen({ navigation }) {
  const [selectedMood, setSelectedMood] = useState('');
  const [notes, setNotes] = useState('');
  const [moodsList, setMoodsList] = useState([]);
  const [relatedActivities, setRelatedActivities] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Fetch moods from database
  useEffect(() => {
    const fetchMoods = async () => {
      try {
        setLoading(true);
        const response = await moodDefinitions.getAll();
        if (response.data && response.data.length > 0) {
          setMoodsList(response.data);
        }
      } catch (error) {
        console.error('Error fetching moods:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء تحميل حالات المزاج');
      } finally {
        setLoading(false);
      }
    };

    fetchMoods();
  }, []);

  // Fetch activities when mood is selected
  useEffect(() => {
    const fetchActivities = async () => {
      if (!selectedMood) {
        setRelatedActivities([]);
        return;
      }

      try {
        setLoadingActivities(true);
        
        // Try to find activities for this mood
        const response = await activities.getByMoodId(selectedMood);
        
        if (response.data && response.data.length > 0) {
          setRelatedActivities(response.data);
        } else {
          setRelatedActivities([]);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setRelatedActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [selectedMood]);

  const toggleActivitySelection = (activityId) => {
    setSelectedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleAdd = async () => {
    if (!selectedMood) {
      Alert.alert('خطأ', 'يرجى اختيار حالة المزاج');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
        return;
      }

      // Create mood log with proper format for RestDB
      const userMoodData = {
        user_id: [{ _id: userId }],
        mood_id: [{ _id: selectedMood }],
        notes: notes,
        activities: selectedActivities,
        created_at: new Date().toISOString()
      };

      const response = await userMoods.create(userMoodData);
      
      Alert.alert('نجاح', 'تم إضافة حالتك المزاجية بنجاح');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding mood:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة الحالة المزاجية');
    }
  };

  const getMoodName = (moodId) => {
    const mood = moodsList.find(m => m._id === moodId);
    return mood ? mood.name : '';
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="إضافة حالة مزاجية" showBackButton onBackPress={() => navigation.goBack()} />
      
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>اختر حالتك المزاجية</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : moodsList.length === 0 ? (
            <Text style={styles.noData}>لا توجد حالات مزاجية متاحة</Text>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedMood}
                onValueChange={setSelectedMood}
                style={styles.picker}
              >
                <Picker.Item label="-- اختر حالة المزاج --" value="" />
                {moodsList.map((mood) => (
                  <Picker.Item key={mood._id} label={mood.name} value={mood._id} />
                ))}
              </Picker>
            </View>
          )}
          
          <TextInput
            style={styles.input}
            placeholder="ملاحظات (اختياري)"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            numberOfLines={4}
          />
        </Card>
        
        {selectedMood && (
          <Card style={styles.card}>
            <Text style={styles.subtitle}>الأنشطة المقترحة</Text>
            
            {loadingActivities ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
            ) : relatedActivities.length === 0 ? (
              <Text style={styles.noData}>لا توجد أنشطة مقترحة لهذه الحالة</Text>
            ) : (
              <View style={styles.activitiesList}>
                {relatedActivities.map((activity) => (
                  <TouchableOpacity 
                    key={activity._id} 
                    style={[
                      styles.activityItem,
                      selectedActivities.includes(activity._id) && styles.selectedActivity
                    ]}
                    onPress={() => toggleActivitySelection(activity._id)}
                  >
                    <Text style={styles.activityText}>{activity.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>
        )}
        
        <Button 
          title="حفظ الحالة المزاجية" 
          onPress={handleAdd} 
          style={styles.addButton}
          disabled={!selectedMood}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    direction: 'rtl'
  },
  content: {
    padding: 16,
    paddingBottom: 32
  },
  card: {
    marginBottom: 16,
    padding: 16
  },
  title: { 
    fontSize: 22, 
    fontWeight: '600', 
    color: colors.text, 
    textAlign: 'right', 
    marginBottom: 16,
    fontFamily: fonts.heading
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
    marginBottom: 12,
    fontFamily: fonts.heading
  },
  pickerContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  picker: { 
    direction: 'rtl',
    textAlign: 'right',
    color: colors.text
  },
  input: { 
    backgroundColor: colors.cardBackground, 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 16, 
    marginBottom: 16,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100
  },
  loader: {
    marginVertical: 20
  },
  noData: {
    textAlign: 'center',
    color: colors.textLight,
    marginVertical: 16,
    fontSize: 16
  },
  activitiesList: {
    marginTop: 8
  },
  activityItem: {
    backgroundColor: colors.lightBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderRightWidth: 4,
    borderRightColor: colors.primary
  },
  selectedActivity: {
    backgroundColor: colors.selectedBackground
  },
  activityText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'right'
  },
  addButton: {
    marginTop: 16
  }
});
