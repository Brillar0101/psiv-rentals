// src/screens/support/HelpCenterScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';

export default function HelpCenterScreen() {
  const navigation = useNavigation();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    { question: 'How do I rent equipment?', answer: 'Browse equipment, select dates, review pricing, and complete payment. You\'ll receive confirmation with pickup details.' },
    { question: 'What payment methods are accepted?', answer: 'We accept all major credit cards, debit cards, Apple Pay, and Google Pay. A security deposit is required.' },
    { question: 'Can I cancel my booking?', answer: 'Yes! Cancel up to 24 hours before pickup for a full refund. Go to My Bookings to manage rentals.' },
    { question: 'What if equipment is damaged?', answer: 'Minor wear is expected. Your security deposit covers repairs. We recommend rental insurance.' },
    { question: 'How long can I rent?', answer: 'From 1 day to several weeks. Daily and weekly rates available. Contact us for custom periods.' },
    { question: 'Where do I pick up?', answer: 'Our studio is in San Francisco. Address and hours in your confirmation email.' },
    { question: 'Is insurance available?', answer: 'Yes! Optional insurance during checkout covers damage, theft, and loss.' },
    { question: 'Late return fees?', answer: 'Late fees at 50% daily rate per day. Contact us to extend your rental.' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={COLORS.textLight} style={{ marginRight: SIZES.sm }} />
          <Text style={styles.searchText}>Search for help...</Text>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq, i) => (
          <View key={i} style={styles.faqCard}>
            <TouchableOpacity style={styles.faqHeader} onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}>
              <Text style={styles.question}>{faq.question}</Text>
              <Text style={styles.toggle}>{expandedFaq === i ? '−' : '+'}</Text>
            </TouchableOpacity>
            {expandedFaq === i && (
              <View style={styles.answer}>
                <Text style={styles.answerText}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.contact}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSub}>Our team is here to assist</Text>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white },
  title: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: SIZES.md, margin: SIZES.paddingHorizontal, marginTop: SIZES.md, borderRadius: SIZES.radius, ...SHADOWS.small },
  searchText: { fontSize: SIZES.body, color: COLORS.textLight },
  sectionTitle: { fontSize: SIZES.h4, fontFamily: FONTS.bold, color: COLORS.text, marginTop: SIZES.lg, marginBottom: SIZES.md, paddingHorizontal: SIZES.paddingHorizontal },
  faqCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, marginHorizontal: SIZES.paddingHorizontal, marginBottom: SIZES.sm, overflow: 'hidden', ...SHADOWS.small },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.md },
  question: { flex: 1, fontSize: SIZES.body, fontFamily: FONTS.semiBold, color: COLORS.text, paddingRight: SIZES.sm },
  toggle: { fontSize: 28, color: COLORS.primary, fontFamily: FONTS.bold },
  answer: { paddingHorizontal: SIZES.md, paddingBottom: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  answerText: { fontSize: SIZES.bodySmall, color: COLORS.textSecondary, lineHeight: 20, paddingTop: SIZES.sm },
  contact: { alignItems: 'center', padding: SIZES.xl, marginTop: SIZES.lg },
  contactTitle: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  contactSub: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: SIZES.lg },
  btn: { backgroundColor: COLORS.primary, paddingHorizontal: SIZES.xl, paddingVertical: SIZES.md, borderRadius: SIZES.radiusPill },
  btnText: { fontSize: SIZES.body, fontFamily: FONTS.semiBold, color: COLORS.white },
});
