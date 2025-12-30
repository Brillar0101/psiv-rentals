// src/navigation/MainNavigator.tsx
// Main Navigator - Bottom tabs + main app screens

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS, SIZES } from '../constants/theme';

// Import real screens
import HomeScreen from '../screens/home/HomeScreen';

// Placeholder screens (will be created in next batches)
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{name}</Text>
    <Text style={styles.placeholderSubtext}>Coming in next batch! 🚀</Text>
  </View>
);

const SearchScreen = () => <PlaceholderScreen name="Search Screen" />;
const BookingsScreen = () => <PlaceholderScreen name="My Bookings" />;
const ProfileScreen = () => <PlaceholderScreen name="Profile Screen" />;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          height: SIZES.tabBarHeight,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={HomeTabs} />
      
      {/* Home navigation screens */}
      <Stack.Screen name="CategoryGrid" component={require('../screens/home/CategoryGridScreen').default} />
      <Stack.Screen name="CategoryDetail" component={require('../screens/home/CategoryDetailScreen').default} />
      <Stack.Screen name="Search" component={require('../screens/home/SearchScreen').default} />
      
      {/* Equipment screens (placeholders for now) */}
      <Stack.Screen 
        name="EquipmentDetail" 
        component={PlaceholderScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  placeholderText: {
    fontSize: SIZES.h2,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  placeholderSubtext: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
});
