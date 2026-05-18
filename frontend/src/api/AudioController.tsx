import { useEffect, useRef } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { useAudioStore } from '@/store/audioStore';
import { useDownloadStore } from '@/store/downloadStore';

export function AudioController() {
  const {
    currentMessage,
    playerState,
    speed,
    seekTime,
    setPlayerState,
    setProgress,
    setDuration,
    setPosition,
  } = useAudioStore();

  const { getDownload } = useDownloadStore();

  const soundRef = useRef<Audio.Sound | null>(null);
  const isUpdatingRef = useRef(false);
  const manualControlLockRef = useRef<number>(0);

  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error(`[AudioController] Playback error: ${status.error}`);
      }
      return;
    }

    // Don't let status updates override manual user actions for a brief moment
    const now = Date.now();
    const isLocked = now < manualControlLockRef.current;

    if (status.didJustFinish) {
      setPlayerState('idle');
      setProgress(0);
      setPosition(0);
      return;
    }

    if (status.durationMillis) {
      setDuration(status.durationMillis / 1000);
      setPosition(status.positionMillis / 1000);
      setProgress(status.positionMillis / status.durationMillis);
      
      // Heartbeat log to confirm playback is actually advancing (for debugging silence)
      if (status.isPlaying && Math.floor(status.positionMillis / 1000) % 5 === 0) {
        console.log(`[AudioController] Playback heartbeat: ${Math.floor(status.positionMillis / 1000)}s / ${Math.floor(status.durationMillis / 1000)}s`);
      }
    }

    if (!isLocked && !isUpdatingRef.current) {
      if (status.isPlaying && playerState !== 'playing') {
        isUpdatingRef.current = true;
        setPlayerState('playing');
        setTimeout(() => (isUpdatingRef.current = false), 100);
      } else if (!status.isPlaying && playerState === 'playing' && !status.isBuffering) {
        isUpdatingRef.current = true;
        setPlayerState('paused');
        setTimeout(() => (isUpdatingRef.current = false), 100);
      }
    }
  };

  // Initialize Audio Mode with more robust settings for physical devices
  useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        });
        console.log('[AudioController] Audio mode initialized');
      } catch (e) {
        console.error('[AudioController] Failed to set audio mode', e);
      }
    }
    setupAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Sync currentMessage (Load new track)
  useEffect(() => {
    let isCancelled = false;

    async function loadNewTrack() {
      // Support both audioUrl (AudioMessage) and videoUrl (VideoMessage fallback)
      const url = (currentMessage as any)?.audioUrl || (currentMessage as any)?.videoUrl;
      if (!url || !currentMessage?.id) return;

      // Unload previous sound synchronously from the reference
      const prevSound = soundRef.current;
      soundRef.current = null;
      if (prevSound) {
        try {
          await prevSound.unloadAsync();
        } catch (e) {
          console.warn('[AudioController] Error unloading previous sound:', e);
        }
      }

      if (isCancelled) return;

      // Check for local URI
      const download = getDownload(currentMessage.id);
      const playSource = (download?.status === 'completed' && download.localUri) 
        ? { uri: download.localUri } 
        : { uri: url };

      const isLocal = playSource.uri.startsWith('file://');
      console.log(`[AudioController] Loading: ${currentMessage.title} from ${isLocal ? 'Local File' : 'Remote URL'}`);

      try {
        const { sound } = await Audio.Sound.createAsync(
          playSource,
          { 
            shouldPlay: playerState === 'playing', 
            rate: speed, 
            shouldCorrectPitch: true,
            volume: 1.0, // Explicitly set volume to 1.0
            progressUpdateIntervalMillis: 500, // Faster updates for smoother UI
          },
          onPlaybackStatusUpdate
        );

        if (isCancelled) {
          // If the effect was cancelled during async load, immediately unload the hijacked sound
          console.log('[AudioController] Aborting hijacked sound playback');
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
        console.log('[AudioController] Sound loaded successfully');
      } catch (e) {
        console.error('[AudioController] Failed to load sound', e);
      }
    }
    
    loadNewTrack();

    return () => {
      isCancelled = true;
    };
  }, [currentMessage?.id]);

  // Sync Play/Pause state
  useEffect(() => {
    async function syncPlayback() {
      if (!soundRef.current || isUpdatingRef.current) return;

      try {
        const status = await soundRef.current.getStatusAsync();
        if (!status.isLoaded) return;

        // Set a lock to prevent the status callback from immediately overriding this action
        manualControlLockRef.current = Date.now() + 800;

        if (playerState === 'playing' && !status.isPlaying) {
          console.log('[AudioController] playAsync() triggered');
          await soundRef.current.playAsync();
        } else if (playerState === 'paused' && status.isPlaying) {
          console.log('[AudioController] pauseAsync() triggered');
          await soundRef.current.pauseAsync();
        }
      } catch (e) {
        console.error('[AudioController] Failed to sync playback', e);
      }
    }
    syncPlayback();
  }, [playerState]);

  // Sync Speed
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setRateAsync(speed, true);
    }
  }, [speed]);

  // Handle manual seeking
  useEffect(() => {
    async function performSeek() {
      if (soundRef.current && seekTime !== null) {
        try {
          await soundRef.current.setPositionAsync(seekTime * 1000);
          // Only clear if the store hasn't changed since we started
          if (useAudioStore.getState().seekTime === seekTime) {
            useAudioStore.setState({ seekTime: null });
          }
        } catch (e) {
          console.error('[AudioController] Failed to seek', e);
        }
      }
    }
    performSeek();
  }, [seekTime]);

  return null;
}
