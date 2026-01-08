// src/screens/support/RateAppScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';

export default function RateAppScreen() {
  const navigation = useNavigation();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStarPress = (star: number) => {
    setRating(star);
    if (star >= 4) {
      // High rating - redirect to app store
      setTimeout(() => {
        Alert.alert(
          'Thank you! 🎉',
          'Would you like to rate us on the App Store?',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Rate Now',
              onPress: () => {
                const appStoreUrl = Platform.OS === 'ios' 
                  ? 'https://apps.apple.com/app/psiv-rentals/id123456789'
                  : 'https://play.google.com/store/apps/details?id=com.psivrentals';
                Linking.openURL(appStoreUrl);
              }
            }
          ]
        );
      }, 500);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Missing Rating', 'Please select a star rating');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    Alert.alert(
      'Thank you! 🙏',
      'Your feedback helps us improve PSIV Rentals',
      [{ text: 'Done', onPress: () => navigation.goBack() }]
    );
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-left" size={28} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Our App</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.heroIcon}><Icon name="star" size={40} color={COLORS.warning} /></View>
            <Text style={styles.heroTitle}>Rate Your Experience</Text>
            <Text style={styles.heroSubtitle}>Help us improve PSIV Rentals</Text>
          </View>
          <View style={styles.ratingCard}>
            <Text style={styles.ratingLabel}>How would you rate us?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleStarPress(star)} style={styles.starBtn}>
                  <Icon name="star" size={48} color={star <= rating ? COLORS.warning : COLORS.border} />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Okay' : 'Poor'}
              </Text>
            )}
          </View>
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Tell us more (optional)</Text>
            <TextInput style={styles.textArea} value={feedback} onChangeText={setFeedback} placeholder="What do you like? What can we improve?" placeholderTextColor={COLORS.textLight} multiline numberOfLines={8} textAlignVertical="top" />
          </View>
          <Button title={loading ? 'Submitting...' : 'Submit Feedback'} onPress={handleSubmit} disabled={loading || rating === 0} fullWidth />
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Why rate us?</Text>
            <View style={styles.benefitRow}><Icon name="check" size={16} color={COLORS.success} style={{ marginRight: SIZES.sm, width: 20 }} /><Text style={styles.benefitText}>Help us improve the app</Text></View>
            <View style={styles.benefitRow}><Icon name="check" size={16} color={COLORS.success} style={{ marginRight: SIZES.sm, width: 20 }} /><Text style={styles.benefitText}>Share your experience with others</Text></View>
            <View style={styles.benefitRow}><Icon name="check" size={16} color={COLORS.success} style={{ marginRight: SIZES.sm, width: 20 }} /><Text style={styles.benefitText}>Support a local business</Text></View>
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
  headerTitle: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text },
  content: { padding: SIZES.paddingHorizontal },
  hero: { alignItems: 'center', marginVertical: SIZES.xl },
  heroIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.warningLight, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md },
  heroTitle: { fontSize: SIZES.h2, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  heroSubtitle: { fontSize: SIZES.body, color: COLORS.textSecondary },
  ratingCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.xl, marginBottom: SIZES.lg, alignItems: 'center', ...SHADOWS.card },
  ratingLabel: { fontSize: SIZES.h4, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.lg },
  starsContainer: { flexDirection: 'row', marginBottom: SIZES.md },
  starBtn: { padding: SIZES.sm },
  ratingText: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: SIZES.sm },
  feedbackCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginBottom: SIZES.lg, ...SHADOWS.card },
  feedbackTitle: { fontSize: SIZES.h4, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.md },
  textArea: { backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: SIZES.md, paddingVertical: SIZES.md, fontSize: SIZES.body, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, height: 120, paddingTop: SIZES.md },
  benefitsCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginTop: SIZES.lg, ...SHADOWS.card },
  benefitsTitle: { fontSize: SIZES.body, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.md },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm },
  benefitText: { fontSize: SIZES.bodySmall, color: COLORS.textSecondary, flex: 1 },
});
