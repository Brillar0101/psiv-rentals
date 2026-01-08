// src/components/AnimatedSplash.tsx
// Professional Welcome Screen with Loading Animation
// Using React Native's built-in Animated API (no reanimated)

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { COLORS } from '../constants/theme';

interface AnimatedSplashProps {
  onAnimationComplete: () => void;
}

const SPLASH_DURATION = 1500;

export default function AnimatedSplash({ onAnimationComplete }: AnimatedSplashProps) {
  const dot1Anim = useRef(new Animated.Value(0.4)).current;
  const dot2Anim = useRef(new Animated.Value(0.4)).current;
  const dot3Anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Start loading animation
    const createDotAnimation = (dotAnim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation = Animated.parallel([
      createDotAnimation(dot1Anim, 0),
      createDotAnimation(dot2Anim, 200),
      createDotAnimation(dot3Anim, 400),
    ]);

    animation.start();

    // Complete after duration
    const timer = setTimeout(() => {
      animation.stop();
      onAnimationComplete();
    }, SPLASH_DURATION);

    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome 😊</Text>

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.loader}>
        <Animated.View style={[styles.loaderDot, { opacity: dot1Anim, transform: [{ scale: dot1Anim }] }]} />
        <Animated.View style={[styles.loaderDot, { opacity: dot2Anim, transform: [{ scale: dot2Anim }] }]} />
        <Animated.View style={[styles.loaderDot, { opacity: dot3Anim, transform: [{ scale: dot3Anim }] }]} />
      </View>
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
    marginTop: -60,
  },
  welcomeText: {
    fontFamily: 'Rubik_600SemiBold',
    fontSize: 36,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 48,
  },
  logoContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    tintColor: '#FFFFFF',
  },
  loader: {
    position: 'absolute',
    bottom: 120,
    flexDirection: 'row',
    gap: 8,
  },
  loaderDot: {
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 4,
  },
});
