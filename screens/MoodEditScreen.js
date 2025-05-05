import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, I18nManager, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { moodDefinitions, moodLogs, activities } from '../services/api';
import { colors, fonts, shadows } from '../utils/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Header from '../components/Header';

// Force RTL layout for Arabic text
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function MoodEditScreen({ route, navigation }) {
  const { user } = useAuth();
  const { moodLog } = route.params;
  const [selectedMood, setSelectedMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [moodsList, setMoodsList] = useState([]);
  const [activitySuggestions, setActivitySuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // جلب قائمة المزاجات
        const moodsResponse = await moodDefinitions.getAll();
        setMoodsList(moodsResponse.data);
        
        // جلب بيانات المزاج الحالي
        if (moodLog) {
          setNotes(moodLog.notes || '');
          // البحث عن المزاج المحدد
          const currentMood = moodsResponse.data.find(m => m.moodid === moodLog.moodid);
          if (currentMood) {
            setSelectedMood(currentMood);
            
            // جلب الأنشطة المقترحة لهذا المزاج
            try {
              const activitiesResponse = await activities.getByMoodId(currentMood.moodid);
              if (activitiesResponse.data && activitiesResponse.data.length > 0) {
                setActivitySuggestions(activitiesResponse.data);
              }
            } catch (activityError) {
              console.error('Error loading activities:', activityError);
            }
          }
        }
      } catch (err) {
        console.error('Error loading mood data:', err);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [moodLog]);

  const handleSave = async () => {
    if (!selectedMood) {
      setError('يرجى اختيار الحالة المزاجية');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // تحديث سجل المزاج
      await moodLogs.update(moodLog._id, { 
        moodid: selectedMood.moodid,
        notes: notes.trim(),
        userid: user._id,
        date: moodLog.date || new Date().toISOString()
      });
      
      Alert.alert(
        'تم الحفظ',
        'تم حفظ التغييرات بنجاح',
        [{ text: 'حسناً', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Error saving mood:', err);
      setError('حدث خطأ في حفظ البيانات');
      setSaving(false);
    }
  };

  const renderMoodItem = (mood) => {
    const isSelected = selectedMood && selectedMood.moodid === mood.moodid;
    
    return (
      <TouchableOpacity 
        key={mood.moodid}
        style={[styles.moodItem, isSelected && styles.selectedMoodItem]}
        onPress={() => setSelectedMood(mood)}
      >
        <View style={[styles.moodIconContainer, { backgroundColor: mood.color + '20' }]}>
          <Ionicons name={mood.icon || 'happy-outline'} size={32} color={mood.color} />
        </View>
        <Text style={[styles.moodName, isSelected && { color: mood.color }]}>{mood.moodname}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="تعديل الحالة المزاجية" 
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
          </Card>
        ) : (
          <>
            <Card style={styles.moodCard}>
              <Text style={styles.sectionTitle}>كيف تشعر اليوم؟</Text>
              <View style={styles.moodsContainer}>
                {moodsList.map(renderMoodItem)}
              </View>
            </Card>
            
            <Card style={styles.notesCard}>
              <Text style={styles.sectionTitle}>ملاحظات (اختياري)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="أضف ملاحظات حول حالتك المزاجية..."
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
                textAlign="right"
              />
            </Card>
            
            {activitySuggestions.length > 0 && (
              <Card style={styles.suggestionsCard}>
                <Text style={styles.sectionTitle}>الأنشطة المقترحة</Text>
                {activitySuggestions.map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={selectedMood?.color || colors.primary} />
                    <Text style={styles.activityText}>{activity.suggestion}</Text>
                  </View>
                ))}
              </Card>
            )}
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <Button 
              title={saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              onPress={handleSave}
              disabled={saving || !selectedMood}
              loading={saving}
              style={styles.saveButton}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingCard: {
    marginVertical: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: fonts.body,
    color: colors.textLight,
    marginTop: 15,
    textAlign: 'right',
  },
  moodCard: {
    marginBottom: 20,
  },
  notesCard: {
    marginBottom: 20,
  },
  suggestionsCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: fonts.subtitle,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'right',
  },
  moodsContainer: {
    flexDirection: 'row-reverse', // RTL layout
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodItem: {
    width: '30%',
    alignItems: 'center',
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMoodItem: {
    borderColor: colors.primary,
    backgroundColor: colors.lightBg,
  },
  moodIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodName: {
    fontSize: fonts.body,
    textAlign: 'center',
    color: colors.text,
  },
  notesInput: {
    backgroundColor: colors.lightBg,
    borderRadius: 10,
    padding: 15,
    height: 120,
    fontSize: fonts.body,
    textAlign: 'right',
  },
  activityItem: {
    flexDirection: 'row-reverse', // RTL layout
    alignItems: 'center',
    marginBottom: 8,
  },
  activityText: {
    fontSize: fonts.body,
    color: colors.text,
    marginRight: 8,
    flex: 1,
    textAlign: 'right',
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 15,
    fontSize: fonts.body,
  },
  saveButton: {
    marginBottom: 30,
  }
});
