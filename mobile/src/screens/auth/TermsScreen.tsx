import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Terms & Conditions - Coming Soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  text: { fontSize: SIZES.h3, color: COLORS.text, fontFamily: FONTS.semiBold },
});
