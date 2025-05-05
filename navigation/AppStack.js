import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// استيراد الشاشات
import HomeScreen from '../screens/HomeScreen';
import MoodListScreen from '../screens/MoodListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MoodSelectionScreen from '../screens/MoodSelectionScreen';
import MoodEditScreen from '../screens/MoodEditScreen';
import ActivitySuggestionScreen from '../screens/ActivitySuggestionScreen';
import AddMoodScreen from '../screens/AddMoodScreen';
import AddActivityScreen from '../screens/AddActivityScreen';

// استيراد الثيم
import { colors } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// مكدس الرئيسية
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MoodSelection" component={MoodSelectionScreen} />
      <Stack.Screen name="ActivitySuggestion" component={ActivitySuggestionScreen} />
      <Stack.Screen name="AddMood" component={AddMoodScreen} />
      <Stack.Screen name="AddActivity" component={AddActivityScreen} />
    </Stack.Navigator>
  );
};

// مكدس قائمة المزاج
const MoodStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MoodListMain" component={MoodListScreen} />
      <Stack.Screen name="MoodEdit" component={MoodEditScreen} />
      <Stack.Screen name="AddMood" component={AddMoodScreen} />
      <Stack.Screen name="AddActivity" component={AddActivityScreen} />
      <Stack.Screen name="MoodSelection" component={MoodSelectionScreen} />
      <Stack.Screen name="ActivitySuggestion" component={ActivitySuggestionScreen} />
    </Stack.Navigator>
  );
};

// مكدس الملف الشخصي
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

// شريط التنقل السفلي
const AppStack = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.cardBg,
          borderTopColor: colors.light,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MoodList') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{ 
          tabBarLabel: 'الرئيسية',
        }} 
      />
      <Tab.Screen 
        name="MoodList" 
        component={MoodStack} 
        options={{ 
          tabBarLabel: 'حالاتي',
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{ 
          tabBarLabel: 'حسابي',
        }} 
      />
    </Tab.Navigator>
  );
};

export default AppStack;
