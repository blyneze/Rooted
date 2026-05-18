import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import theme from '@/theme';

const FAQ_ITEMS = [
  {
    question: 'How do I download messages?',
    answer: 'Simply tap the download icon on any message card or detail view to save it for offline listening.',
  },
  {
    question: 'How do I change my password?',
    answer: 'Navigate to Profile > Change password to update your account password securely.',
  },
  {
    question: 'Where can I see my saved items?',
    answer: 'Your library tab houses all your downloaded messages, saved series, and custom playlists.',
  },
  {
    question: 'Is the app completely free?',
    answer: 'Yes! All content on Rooted is generously provided free of charge to help you grow in your faith.',
  },
];

export default function HelpSupportScreen() {
  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@rootedapp.com?subject=Rooted Support Request');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Typography variant="heading3" style={styles.headerTitle}>Help & Support</Typography>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerSpacer} />
        <Typography variant="heading2" style={styles.title}>How can we help?</Typography>
        <Typography variant="body" color="secondary" style={styles.subtitle}>
          Find answers to common questions below, or reach out to our team directly.
        </Typography>

        <TouchableOpacity style={styles.supportCard} onPress={handleEmailSupport} activeOpacity={0.8}>
          <View style={styles.supportIconWrap}>
            <Ionicons name="mail" size={24} color={theme.colors.accent} />
          </View>
          <View style={styles.supportTextWrap}>
            <Typography variant="title">Contact Support</Typography>
            <Typography variant="bodySmall" color="secondary">
              Average response time: 24-48 hours
            </Typography>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <Typography variant="heading3" style={styles.faqHeader}>Frequently Asked Questions</Typography>
        
        <View style={styles.faqList}>
          {FAQ_ITEMS.map((item, index) => (
            <View key={index} style={[styles.faqItem, index < FAQ_ITEMS.length - 1 && styles.faqItemBorder]}>
              <Typography variant="title" style={styles.faqQuestion}>{item.question}</Typography>
              <Typography variant="body" color="secondary" style={styles.faqAnswer}>{item.answer}</Typography>
            </View>
          ))}
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
  },
  backBtn: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingBottom: 40,
  },
  headerSpacer: {
    height: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    marginBottom: theme.spacing['2xl'],
    lineHeight: 22,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing['2xl'],
  },
  supportIconWrap: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  supportTextWrap: {
    flex: 1,
    gap: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.surfaceMid,
    marginBottom: theme.spacing['2xl'],
  },
  faqHeader: {
    marginBottom: theme.spacing.lg,
  },
  faqList: {
    marginBottom: theme.spacing.xl,
  },
  faqItem: {
    paddingVertical: theme.spacing.lg,
  },
  faqItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
  },
  faqQuestion: {
    marginBottom: 8,
    color: theme.colors.textPrimary,
  },
  faqAnswer: {
    lineHeight: 24,
    fontSize: theme.fontSize.base,
  },
});
