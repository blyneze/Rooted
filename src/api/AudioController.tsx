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

  // ... (onPlaybackStatusUpdate logic remains same)
  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;

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
    }

    if (status.isPlaying && playerState !== 'playing') {
      isUpdatingRef.current = true;
      setPlayerState('playing');
      setTimeout(() => (isUpdatingRef.current = false), 100);
    } else if (!status.isPlaying && playerState === 'playing' && !status.isBuffering) {
      isUpdatingRef.current = true;
      setPlayerState('paused');
      setTimeout(() => (isUpdatingRef.current = false), 100);
    }
  };

  // Initialize Audio Mode
  useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        });
      } catch (e) {
        console.error('Failed to set audio mode', e);
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
    async function loadNewTrack() {
      if (!currentMessage?.audioUrl) return;

      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Check for local URI
      const download = getDownload(currentMessage.id);
      const playSource = (download?.status === 'completed' && download.localUri) 
        ? { uri: download.localUri } 
        : { uri: currentMessage.audioUrl };

      console.log(`[AudioController] Loading track: ${currentMessage.title} from ${playSource.uri.startsWith('file://') ? 'Local File' : 'Remote URL'}`);

      try {
        const { sound } = await Audio.Sound.createAsync(
          playSource,
          { shouldPlay: playerState === 'playing', rate: speed, shouldCorrectPitch: true },
          onPlaybackStatusUpdate
        );
        soundRef.current = sound;
      } catch (e) {
        console.error('Failed to load sound', e);
      }
    }
    loadNewTrack();
  }, [currentMessage?.id]);

  // Sync Play/Pause state
  useEffect(() => {
    async function syncPlayback() {
      if (!soundRef.current || isUpdatingRef.current) return;

      try {
        const status = await soundRef.current.getStatusAsync();
        if (!status.isLoaded) return;

        if (playerState === 'playing' && !status.isPlaying) {
          await soundRef.current.playAsync();
        } else if (playerState === 'paused' && status.isPlaying) {
          await soundRef.current.pauseAsync();
        }
      } catch (e) {
        console.error('Failed to sync playback', e);
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
          console.error('Failed to seek', e);
        }
      }
    }
    performSeek();
  }, [seekTime]);


  return null;
}
