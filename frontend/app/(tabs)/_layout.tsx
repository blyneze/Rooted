import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { MiniPlayer } from '@/components/audio/MiniPlayer';
import { FullPlayer } from '@/components/audio/FullPlayer';
import { useAudioStore } from '@/store/audioStore';
import theme from '@/theme';

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  index: { active: 'home', inactive: 'home-outline' },
  bible: { active: 'book', inactive: 'book-outline' },
  library: { active: 'library', inactive: 'library-outline' },
  downloads: { active: 'arrow-down-circle', inactive: 'arrow-down-circle-outline' },
  profile: { active: 'person-circle', inactive: 'person-circle-outline' },
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  bible: 'Bible',
  library: 'Library',
  downloads: 'Downloads',
  profile: 'Profile',
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isMiniPlayerVisible } = useAudioStore();

  return (
    <>
      {/* Mini Player sits above tab bar */}
      {isMiniPlayerVisible && (
        <View style={[styles.miniPlayerSlot, { bottom: 49 + insets.bottom }]}>
          <MiniPlayer />
        </View>
      )}

      <View style={[styles.tabBar, { paddingBottom: insets.bottom, height: 49 + insets.bottom }]}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const name = route.name;
          const icons = TAB_ICONS[name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFocused ? icons.active : icons.inactive}
                size={22}
                color={isFocused ? theme.colors.accent : theme.colors.textTertiary}
              />
              <Typography
                variant="caption"
                style={[
                  styles.tabLabel,
                  { color: isFocused ? theme.colors.accent : theme.colors.textTertiary },
                ]}
              >
                {TAB_LABELS[name]}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/welcome" />;

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="bible" />
        <Tabs.Screen name="library" />
        <Tabs.Screen name="downloads" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <FullPlayer />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceElevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.surfaceMid,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  miniPlayerSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: theme.zIndex.player,
  },
});
