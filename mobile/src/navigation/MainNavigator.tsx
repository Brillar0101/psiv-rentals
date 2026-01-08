// src/navigation/MainNavigator.tsx
// FIXED: Professional Feather icons with Rubik font
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { useCartStore } from '../store/cartStore';
import {
  Icon,
  HomeIcon,
  SearchIcon,
  BookingsIcon,
  CartIcon,
  ProfileIcon,
} from '../components/ui/Icon';

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
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {itemCount > 9 ? '9+' : itemCount}
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
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <HomeIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <SearchIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <BookingsIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={require('../screens/booking/CartScreen').default}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <CartIcon color={color} focused={focused} />
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
          tabBarIcon: ({ color, focused }) => (
            <ProfileIcon color={color} focused={focused} />
          ),
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
        name="Categories" 
        component={require('../screens/equipment/CategoriesScreen').default}
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
        name="CardDetails"
        component={require('../screens/payment/CardDetailsScreen').default}
      />
      <Stack.Screen
        name="StripePayment"
        component={require('../screens/payment/StripePaymentScreen').default}
      />
      <Stack.Screen
        name="BookingConfirmation"
        component={require('../screens/booking/BookingConfirmationScreen').default}
      />
      
      {/* Support */}
      <Stack.Screen 
        name="HelpCenter" 
        component={require('../screens/support/HelpCenterScreen').default}
      />
      <Stack.Screen 
        name="ContactSupport" 
        component={require('../screens/support/ContactSupportScreen').default}
      />
      <Stack.Screen 
        name="RateApp" 
        component={require('../screens/support/RateAppScreen').default}
      />
      
      {/* Profile */}
      <Stack.Screen 
        name="EditProfile" 
        component={require('../screens/profile/EditProfileScreen').default}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={require('../screens/profile/ChangePasswordScreen').default}
      />
      <Stack.Screen 
        name="ActiveBookings" 
        component={require('../screens/profile/ActiveBookingsScreen').default}
      />
      <Stack.Screen 
        name="PastBookings" 
        component={require('../screens/profile/PastBookingsScreen').default}
      />
      <Stack.Screen 
        name="Favorites" 
        component={require('../screens/profile/FavoritesScreen').default}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: SIZES.tabBarHeight,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    marginTop: 4,
  },
  tabItem: {
    paddingVertical: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
    fontSize: 10,
  },
});
