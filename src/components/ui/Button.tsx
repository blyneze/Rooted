import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Typography } from './Typography';
import theme from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: {
      backgroundColor: theme.colors.accent,
    },
    text: {
      color: '#FFFFFF',
    },
  },
  secondary: {
    container: {
      backgroundColor: theme.colors.surfaceMid,
      borderWidth: 0,
    },
    text: {
      color: theme.colors.textPrimary,
    },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.surfaceBorder,
    },
    text: {
      color: theme.colors.textPrimary,
    },
  },
  danger: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.accent,
    },
    text: {
      color: theme.colors.accent,
    },
  },
};

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.radius.md },
    text: { fontSize: theme.fontSize.sm },
  },
  md: {
    container: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: theme.radius.lg },
    text: { fontSize: theme.fontSize.base },
  },
  lg: {
    container: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: theme.radius.xl },
    text: { fontSize: theme.fontSize.md },
  },
};

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled || isLoading}
      style={[
        styles.base,
        vs.container,
        ss.container,
        fullWidth && styles.fullWidth,
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFF' : theme.colors.accent}
        />
      ) : (
        <View style={styles.inner}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Typography
            variant="label"
            style={[vs.text, ss.text, { fontWeight: theme.fontWeight.semibold }]}
          >
            {label}
          </Typography>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;
