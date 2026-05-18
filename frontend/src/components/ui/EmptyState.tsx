import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import theme from '@/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ icon = 'albums-outline', title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color={theme.colors.textTertiary} />
      </View>
      <Typography variant="title" align="center" style={styles.title}>
        {title}
      </Typography>
      {description && (
        <Typography variant="bodySmall" color="tertiary" align="center" style={styles.description}>
          {description}
        </Typography>
      )}
      {action && (
        <TouchableOpacity style={styles.action} onPress={action.onPress} activeOpacity={0.75}>
          <Typography variant="label" color="accent">
            {action.label}
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['4xl'],
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  description: {
    textAlign: 'center',
    maxWidth: 260,
  },
  action: {
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
});

export default EmptyState;
