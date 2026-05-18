import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import theme from '@/theme';

interface ShelfRowProps {
  title: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
  subtitle?: string;
}

export function ShelfRow({ title, onSeeAll, children, subtitle }: ShelfRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Typography variant="heading3">{title}</Typography>
          {subtitle && (
            <Typography variant="caption" color="tertiary" style={{ marginTop: 2 }}>
              {subtitle}
            </Typography>
          )}
        </View>
        {onSeeAll && (
          <TouchableOpacity
            style={styles.seeAll}
            onPress={onSeeAll}
            activeOpacity={0.7}
            hitSlop={12}
          >
            <Typography variant="label" color="accent">
              See all
            </Typography>
            <Ionicons name="chevron-forward" size={14} color={theme.colors.accent} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.md,
  },
  titleGroup: {
    flex: 1,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 8,
    alignSelf: 'center',
  },
  scrollContent: {
    paddingLeft: theme.spacing.base,
    paddingRight: theme.spacing.base - theme.spacing.md,
  },
});

export default ShelfRow;
