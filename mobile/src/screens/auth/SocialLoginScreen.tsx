import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONT_WEIGHTS } from '../../constants/theme';

export default function SocialLoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Social Login - Coming Soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  text: { fontSize: SIZES.h3, color: COLORS.text, fontWeight: FONT_WEIGHTS.semiBold },
});
