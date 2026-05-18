import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { useMessage } from '@/api/queries';
import { useAudioStore } from '@/store/audioStore';
import theme from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = SCREEN_WIDTH * (9 / 16);

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: video, isLoading } = useMessage(id);
  const { playerState, setPlayerState } = useAudioStore();

  useEffect(() => {
    // Automatically pause any background audio when entering a video screen
    if (playerState === 'playing') {
      setPlayerState('paused');
    }
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Typography variant="body" color="tertiary" align="center" style={{ marginTop: 40 }}>
          Loading video...
        </Typography>
      </SafeAreaView>
    );
  }

  if (!video || (video as any).type !== 'video') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <Typography variant="body" color="tertiary" align="center">
          Video not found
        </Typography>
      </SafeAreaView>
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body { margin: 0; padding: 0; background-color: #000; overflow: hidden; }
          iframe { width: 100vw; height: 100vh; border: none; }
        </style>
      </head>
      <body>
        <iframe 
          src="https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&autoplay=0&controls=1&modestbranding=1&playsinline=1&enablejsapi=1&origin=https://localhost" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen>
        </iframe>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Video Player ─────────────────────────────────────────────────── */}
      <View style={styles.videoWrapper}>
        <WebView
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          bounces={false}
          source={{ html: htmlContent, baseUrl: 'https://localhost' }}
          originWhitelist={['*']}
        />
        <TouchableOpacity style={styles.backOverlay} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.meta}>
          <Typography variant="heading2" style={styles.title}>
            {video.title}
          </Typography>
          
          <View style={styles.speakerRow}>
            <Typography variant="body" color="accent" weight="semibold">
              {video.speakerName || 'Unknown Speaker'}
            </Typography>
            <View style={styles.dot} />
            <Typography variant="body" color="secondary">
              Teaching
            </Typography>
          </View>

          <View style={styles.descriptionSection}>
            <Typography variant="body" color="secondary" style={styles.description}>
              {video.description}
            </Typography>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {video.topicTags?.map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Typography variant="caption" color="secondary">
                  {tag}
                </Typography>
              </View>
            ))}
          </View>
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
    padding: theme.spacing.base,
  },
  backBtn: {
    padding: 4,
  },
  videoWrapper: {
    width: '100%',
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  backOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  meta: {
    padding: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.base,
    lineHeight: 34,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surfaceBorder,
    marginHorizontal: theme.spacing.md,
  },
  descriptionSection: {
    marginBottom: theme.spacing.xl,
  },
  description: {
    lineHeight: 26,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceBorder,
  },
});
