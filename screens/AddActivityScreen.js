import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { moodDefinitions, activities } from '../services/api';
import { colors, fonts, shadows } from '../utils/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Header from '../components/Header';

const AddActivityScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [suggestion, setSuggestion] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [moodsList, setMoodsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMoods, setFetchingMoods] = useState(true);

  // Fetch moods from database
  useEffect(() => {
    const fetchMoods = async () => {
      try {
        setFetchingMoods(true);
        
        // If user is logged in, fetch their moods
        if (user && user._id) {
          const response = await moodDefinitions.getByUserId(user._id);
          if (response.data && response.data.length > 0) {
            setMoodsList(response.data);
            console.log('User moods loaded:', response.data.length);
          } else {
            // If no user-specific moods, get all moods
            const allMoodsResponse = await moodDefinitions.getAll();
            setMoodsList(allMoodsResponse.data || []);
            console.log('All moods loaded:', allMoodsResponse.data?.length || 0);
          }
        } else {
          // If not logged in, get all moods
          const response = await moodDefinitions.getAll();
          setMoodsList(response.data || []);
          console.log('All moods loaded:', response.data?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching moods:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء تحميل حالات المزاج');
      } finally {
        setFetchingMoods(false);
      }
    };

    fetchMoods();
  }, [user]);

  const handleAddActivity = async () => {
    if (!suggestion.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال النشاط المقترح');
      return;
    }

    if (!selectedMood) {
      Alert.alert('خطأ', 'يرجى اختيار حالة مزاجية');
      return;
    }

    try {
      setLoading(true);
      
      // Get the highest existing activity id to create a new one
      const activitiesResponse = await activities.getAll();
      const existingActivities = activitiesResponse.data || [];
      const highestId = existingActivities.reduce((max, activity) => 
        activity.id > max ? activity.id : max, 0);
      
      const newId = highestId + 1;
      
      // Get the selected mood details
      const selectedMoodObj = moodsList.find(m => m._id === selectedMood);
      
      // Create the new activity
      const newActivity = {
        id: newId,
        suggestion: suggestion,
        name: [{ _id: selectedMood }],
        moodid: [{ _id: selectedMood }]
      };
      
      console.log('Creating new activity:', newActivity);
      const response = await activities.create(newActivity);
      
      console.log('Activity created successfully:', response.data);
      Alert.alert('نجاح', 'تم إضافة النشاط بنجاح');
      
      // Navigate back to the previous screen
      navigation.goBack();
    } catch (error) {
      console.error('Error adding activity:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة النشاط');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="إضافة نشاط جديد" 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.label}>اختر الحالة المزاجية</Text>
          
          {fetchingMoods ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
          ) : moodsList.length === 0 ? (
            <View>
              <Text style={styles.noData}>لا توجد حالات مزاجية متاحة</Text>
              <Button 
                title="إضافة حالة مزاجية جديدة" 
                onPress={() => navigation.navigate('AddMood')}
                style={styles.addMoodButton}
              />
            </View>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedMood}
                onValueChange={(itemValue) => setSelectedMood(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="-- اختر حالة المزاج --" value="" />
                {moodsList.map((mood) => (
                  <Picker.Item key={mood._id} label={mood.moodname} value={mood._id} />
                ))}
              </Picker>
            </View>
          )}
          
          <Text style={styles.label}>النشاط المقترح</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={suggestion}
            onChangeText={setSuggestion}
            placeholder="اكتب النشاط المقترح هنا..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          
          <Button
            title="إضافة النشاط"
            onPress={handleAddActivity}
            disabled={loading || fetchingMoods || moodsList.length === 0}
            loading={loading}
            style={styles.button}
          />
        </Card>
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
    padding: 16
  },
  card: {
    padding: 16,
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'right',
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
    borderColor: colors.border
  },
  textArea: {
    minHeight: 100
  },
  button: {
    marginTop: 16
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
  addMoodButton: {
    marginBottom: 16
  }
});

export default AddActivityScreen;
