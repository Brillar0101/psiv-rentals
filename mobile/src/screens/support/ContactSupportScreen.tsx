// src/screens/support/ContactSupportScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function ContactSupportScreen() {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!email || !message) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    Alert.alert('Message Sent! ✅', 'We\'ll get back to you within 24 hours.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.heroIcon}><Text style={styles.heroIconText}>💬</Text></View>
            <Text style={styles.heroTitle}>How can we help?</Text>
            <Text style={styles.heroSubtitle}>Our support team is here to assist you</Text>
          </View>
          <View style={styles.methodsSection}>
            <Text style={styles.sectionTitle}>Contact Methods</Text>
            <TouchableOpacity style={styles.methodCard} onPress={() => Linking.openURL('mailto:support@psivrentals.com')}>
              <View style={styles.methodIcon}><Text style={styles.methodIconText}>📧</Text></View>
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>Email Us</Text>
                <Text style={styles.methodDescription}>support@psivrentals.com</Text>
              </View>
              <Text style={styles.methodArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.methodCard} onPress={() => Linking.openURL('tel:+15551234567')}>
              <View style={styles.methodIcon}><Text style={styles.methodIconText}>📞</Text></View>
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>Call Us</Text>
                <Text style={styles.methodDescription}>+1 (555) 123-4567</Text>
              </View>
              <Text style={styles.methodArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.methodCard} onPress={() => Linking.openURL('https://wa.me/15551234567')}>
              <View style={styles.methodIcon}><Text style={styles.methodIconText}>💬</Text></View>
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>WhatsApp</Text>
                <Text style={styles.methodDescription}>Chat with us</Text>
              </View>
              <Text style={styles.methodArrow}>→</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Send us a message</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={COLORS.textLight} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput style={[styles.input, styles.textArea]} value={message} onChangeText={setMessage} placeholder="How can we help you?" placeholderTextColor={COLORS.textLight} multiline numberOfLines={6} textAlignVertical="top" />
            </View>
            <Button title={loading ? 'Sending...' : 'Send Message'} onPress={handleSendMessage} disabled={loading} fullWidth />
          </View>
          <View style={styles.hoursCard}>
            <Text style={styles.hoursTitle}>📅 Business Hours</Text>
            <Text style={styles.hoursText}>Monday - Friday: 9:00 AM - 6:00 PM</Text>
            <Text style={styles.hoursText}>Saturday: 10:00 AM - 4:00 PM</Text>
            <Text style={styles.hoursText}>Sunday: Closed</Text>
          </View>
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white, ...SHADOWS.small },
  backIcon: { fontSize: 28, color: COLORS.text },
  headerTitle: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  content: { padding: SIZES.paddingHorizontal },
  hero: { alignItems: 'center', marginVertical: SIZES.xl },
  heroIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryAlpha, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md },
  heroIconText: { fontSize: 40 },
  heroTitle: { fontSize: SIZES.h2, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  heroSubtitle: { fontSize: SIZES.body, color: COLORS.textSecondary },
  methodsSection: { marginBottom: SIZES.lg },
  sectionTitle: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.md },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.md, marginBottom: SIZES.sm, ...SHADOWS.card },
  methodIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.md },
  methodIconText: { fontSize: 24 },
  methodContent: { flex: 1 },
  methodTitle: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  methodDescription: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  methodArrow: { fontSize: 20, color: COLORS.textSecondary },
  formSection: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginBottom: SIZES.lg, ...SHADOWS.card },
  formTitle: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.lg },
  inputGroup: { marginBottom: SIZES.lg },
  label: { fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, marginBottom: SIZES.sm },
  input: { backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: SIZES.md, paddingVertical: SIZES.md, fontSize: SIZES.body, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  textArea: { height: 120, paddingTop: SIZES.md },
  hoursCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, ...SHADOWS.card },
  hoursTitle: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.md },
  hoursText: { fontSize: SIZES.bodySmall, color: COLORS.textSecondary, marginBottom: SIZES.xs },
});
