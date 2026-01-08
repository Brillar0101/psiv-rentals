import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';

export default function ReportIssueScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>ReportIssueScreen</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="flag" size={64} color={COLORS.primary} />
        </View>
        <Text style={styles.subtitle}>Coming soon!</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: SIZES.xl }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white },
  title: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  iconContainer: { marginBottom: SIZES.lg },
  subtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: SIZES.md },
});
