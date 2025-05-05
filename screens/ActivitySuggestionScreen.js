import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { api } from '../services/api';
import { Alert } from 'react-native';

export default function ActivitySuggestionScreen({ route, navigation }) {
  const { mood } = route.params;
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get(`/activities?mood=${encodeURIComponent(mood)}`);
        setSuggestions(response.data);
      } catch (err) {
        console.error(err);
        Alert.alert('خطأ', 'حدث خطأ أثناء جلب الاقتراحات');
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>اقتراحات أنشطة لحالة {mood}</Text>
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.suggestion}>{item.suggestion}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('MoodList')}>
        <Text style={styles.buttonText}>عرض حالاتك</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', padding: 20 },
  title: { fontSize: 24, fontWeight: '600', textAlign: 'center', marginBottom: 20, color: '#333' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  suggestion: { fontSize: 18, color: '#333' },
  button: { backgroundColor: '#007aff', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});
