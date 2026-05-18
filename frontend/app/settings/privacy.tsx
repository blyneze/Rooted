import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import theme from '@/theme';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Typography variant="heading3" style={styles.headerTitle}>Privacy Policy</Typography>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerSpacer} />
        <Typography variant="heading2" style={styles.title}>Privacy Policy</Typography>
        <Typography variant="body" color="tertiary" style={styles.date}>Effective: April 10, 2026</Typography>

        <View style={styles.section}>
          <Typography variant="title" style={styles.sectionTitle}>1. Information We Collect</Typography>
          <Typography variant="body" color="secondary" style={styles.paragraph}>
            We collect information that you explicitly provide to us, such as your name, email address, and profile picture when you create an account along with any content you save or highlight within the app.
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="title" style={styles.sectionTitle}>2. How We Use Your Information</Typography>
          <Typography variant="body" color="secondary" style={styles.paragraph}>
            The information we collect is strictly used to provide, maintain, and improve the Rooted app experience. We use your data to synchronize your saved messages, playlists, and bible study notes across your devices securely.
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="title" style={styles.sectionTitle}>3. Data Security</Typography>
          <Typography variant="body" color="secondary" style={styles.paragraph}>
            We prioritize the security of your personal information. All authentication and data storage utilize modern encryption standards powered by enterprise-grade providers like Clerk and PostgreSQL. However, no method of transmission over the internet or electronic storage is 100% secure.
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="title" style={styles.sectionTitle}>4. Third-Party Services</Typography>
          <Typography variant="body" color="secondary" style={styles.paragraph}>
            Rooted relies on select third-party services to function (such as authentication and database hosting). These services may collect certain anonymized usage data in accordance with their own privacy policies.
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="title" style={styles.sectionTitle}>5. Contact Us</Typography>
          <Typography variant="body" color="secondary" style={styles.paragraph}>
            If you have any questions or concerns regarding these policies, your stored data, or your account rights, please feel free to reach out to us at privacy@rootedapp.com.
          </Typography>
        </View>
        
        <View style={{ height: 100 }} />
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
  date: {
    marginBottom: theme.spacing['3xl'],
  },
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  sectionTitle: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  paragraph: {
    lineHeight: 24,
    fontSize: theme.fontSize.base,
  },
});
