import React from 'react';
import {
  Text,
  TextProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import theme from '@/theme';

type Variant =
  | 'display'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'title'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'overline';

type Color = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'inverse';

interface TypographyProps extends TextProps {
  variant?: Variant;
  color?: Color;
  weight?: keyof typeof theme.fontWeight;
  align?: TextStyle['textAlign'];
  children: React.ReactNode;
}

const variantStyles: Record<Variant, TextStyle> = {
  display: {
    fontSize: theme.fontSize['4xl'],
    fontWeight: theme.fontWeight.heavy,
    letterSpacing: theme.letterSpacing.tight,
    lineHeight: theme.fontSize['4xl'] * theme.lineHeight.tight,
  },
  heading1: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    letterSpacing: theme.letterSpacing.tight,
    lineHeight: theme.fontSize['3xl'] * theme.lineHeight.tight,
  },
  heading2: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    letterSpacing: theme.letterSpacing.tight,
    lineHeight: theme.fontSize['2xl'] * theme.lineHeight.normal,
  },
  heading3: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: theme.letterSpacing.normal,
    lineHeight: theme.fontSize.xl * theme.lineHeight.normal,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: theme.letterSpacing.normal,
    lineHeight: theme.fontSize.md * theme.lineHeight.normal,
  },
  body: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.regular,
    letterSpacing: theme.letterSpacing.normal,
    lineHeight: theme.fontSize.base * theme.lineHeight.relaxed,
  },
  bodySmall: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.regular,
    letterSpacing: theme.letterSpacing.normal,
    lineHeight: theme.fontSize.sm * theme.lineHeight.relaxed,
  },
  caption: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.regular,
    letterSpacing: theme.letterSpacing.wide,
    lineHeight: theme.fontSize.xs * theme.lineHeight.normal,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    letterSpacing: theme.letterSpacing.normal,
    lineHeight: theme.fontSize.sm * theme.lineHeight.normal,
  },
  overline: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: theme.letterSpacing.widest,
    lineHeight: theme.fontSize.xs * theme.lineHeight.normal,
    textTransform: 'uppercase',
  },
};

const colorMap: Record<Color, string> = {
  primary: theme.colors.textPrimary,
  secondary: theme.colors.textSecondary,
  tertiary: theme.colors.textTertiary,
  accent: theme.colors.accent,
  inverse: theme.colors.textInverse,
};

export function Typography({
  variant = 'body',
  color = 'primary',
  weight,
  align,
  style,
  children,
  ...rest
}: TypographyProps) {
  return (
    <Text
      style={[
        variantStyles[variant],
        { color: colorMap[color] },
        weight && { fontWeight: theme.fontWeight[weight] },
        align && { textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

export default Typography;
