// src/screens/auth/SplashScreen.tsx
// Splash Screen - App loading screen with PSIV branding

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS, SIZES, FONT_WEIGHTS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🎬</Text>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>PSIV Rentals</Text>
        <Text style={styles.tagline}>Professional Equipment Rental</Text>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingProgress,
                {
                  opacity: fadeAnim,
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>

      {/* Footer */}
      <Text style={styles.footer}>Powered by PSIV Studios</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  logoEmoji: {
    fontSize: 64,
  },
  appName: {
    fontSize: SIZES.h1 + 8,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    marginBottom: SIZES.sm,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: SIZES.body,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SIZES.xxl,
  },
  loadingContainer: {
    marginTop: SIZES.xl,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    width: '70%',
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: SIZES.xl,
    fontSize: SIZES.caption,
    color: COLORS.white,
    opacity: 0.7,
  },
});
