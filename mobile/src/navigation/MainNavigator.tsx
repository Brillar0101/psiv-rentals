// src/navigation/MainNavigator.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, SIZES } from '../constants/theme';
import { useCartStore } from '../store/cartStore';

// Import real screens
import HomeScreen from '../screens/home/HomeScreen';
import EquipmentDetailScreen from '../screens/equipment/EquipmentDetailScreen';
import DateSelectionScreen from '../screens/booking/DateSelectionScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SearchScreen from '../screens/home/SearchScreen';
import MyBookingsScreen from '../screens/profile/MyBookingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Cart Badge Component
function CartBadge() {
  const itemCount = useCartStore(state => state.getTotalItems());
  
  if (itemCount === 0) return null;
  
  return (
    <View style={{
      position: 'absolute',
      top: -5,
      right: -10,
      backgroundColor: COLORS.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    }}>
      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
        {itemCount}
      </Text>
    </View>
  );
}

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
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={require('../screens/booking/CartScreen').default}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color }) => (
            <View>
              <Text style={{ fontSize: 24 }}>🛒</Text>
              <CartBadge />
            </View>
          ),
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

// Main Stack Navigator
export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={HomeTabs} />
      
      {/* Equipment & Booking Flow */}
      <Stack.Screen 
        name="EquipmentDetail" 
        component={EquipmentDetailScreen}
      />
      <Stack.Screen 
        name="CategoryDetail" 
        component={require('../screens/equipment/CategoryDetailScreen').default}
      />
      <Stack.Screen 
        name="DateSelection" 
        component={DateSelectionScreen}
      />
      <Stack.Screen 
        name="AddToCartConfirm" 
        component={require('../screens/booking/AddToCartConfirmScreen').default}
      />
      
      {/* Payment Flow */}
      <Stack.Screen 
        name="PaymentMethod" 
        component={require('../screens/payment/PaymentMethodScreen').default}
      />
      <Stack.Screen 
        name="StripePayment" 
        component={require('../screens/payment/StripePaymentScreen').default}
      />
      
      {/* Support */}
      <Stack.Screen 
        name="HelpCenter" 
        component={require('../screens/support/HelpCenterScreen').default}
      />
    </Stack.Navigator>
  );
}
