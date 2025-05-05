import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { moodDefinitions } from '../services/api';
import { colors, fonts, shadows } from '../utils/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Header from '../components/Header';

const AddMoodScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [moodName, setMoodName] = useState('');
  const [moodDescription, setMoodDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMood = async () => {
    if (!moodName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم الحالة المزاجية');
      return;
    }

    try {
      setLoading(true);
      
      // Get the highest existing moodid to create a new one
      const moodsResponse = await moodDefinitions.getAll();
      const existingMoods = moodsResponse.data || [];
      const highestMoodId = existingMoods.reduce((max, mood) => 
        mood.moodid > max ? mood.moodid : max, 0);
      
      const newMoodId = highestMoodId + 1;
      
      // Create the new mood
      const newMood = {
        moodid: newMoodId,
        moodname: moodName,
        mooddesc: moodDescription || '',
        userid: user ? [{ _id: user._id }] : []
      };
      
      console.log('Creating new mood:', newMood);
      const response = await moodDefinitions.create(newMood);
      
      console.log('Mood created successfully:', response.data);
      Alert.alert('نجاح', 'تم إضافة الحالة المزاجية بنجاح');
      
      // Navigate back to the previous screen
      navigation.goBack();
    } catch (error) {
      console.error('Error adding mood:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة الحالة المزاجية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="إضافة حالة مزاجية جديدة" 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.label}>اسم الحالة المزاجية</Text>
          <TextInput
            style={styles.input}
            value={moodName}
            onChangeText={setMoodName}
            placeholder="مثال: سعيد، حزين، متحمس..."
            placeholderTextColor={colors.textLight}
          />
          
          <Text style={styles.label}>وصف الحالة (اختياري)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={moodDescription}
            onChangeText={setMoodDescription}
            placeholder="وصف مختصر للحالة المزاجية..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          
          <Button
            title="إضافة الحالة المزاجية"
            onPress={handleAddMood}
            disabled={loading}
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
  }
});

export default AddMoodScreen;
