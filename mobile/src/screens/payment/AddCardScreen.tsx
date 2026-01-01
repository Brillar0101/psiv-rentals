// src/screens/payment/AddCardScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function AddCardScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Card</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.emoji}>💳</Text>
        <Text style={styles.subtitle}>Add your credit or debit card</Text>
        <Text style={styles.description}>Coming soon!</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: SIZES.xl }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white },
  backIcon: { fontSize: 28, color: COLORS.text },
  title: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  emoji: { fontSize: 64, marginBottom: SIZES.lg },
  subtitle: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, marginBottom: SIZES.sm },
  description: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: SIZES.md },
});
