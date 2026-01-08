import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';

export default function ServerErrorScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name="cloud-off" size={64} color={COLORS.error} />
      </View>
      <Text style={styles.title}>ServerErrorScreen</Text>
      <Text style={styles.subtitle}>This is a utility screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  iconContainer: { marginBottom: SIZES.md },
  title: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  subtitle: { fontSize: SIZES.body, color: COLORS.textSecondary },
});
