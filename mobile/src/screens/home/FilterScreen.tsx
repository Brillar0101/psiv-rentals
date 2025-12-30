import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONT_WEIGHTS } from '../../constants/theme';

export default function FilterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filter Screen</Text>
      <Text style={styles.subtitle}>Coming in next update!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  title: { fontSize: SIZES.h2, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  subtitle: { fontSize: SIZES.body, color: COLORS.textSecondary },
});
