import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { Theme } from "@/constants/theme";

type Props = { audioUrl: string };

export function IncidentAudioPlayer({ audioUrl }: Props) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, []);

  useEffect(() => {
    const prev = soundRef.current;
    soundRef.current = null;
    setPlaying(false);
    prev?.unloadAsync().catch(() => {});
  }, [audioUrl]);

  const toggle = async () => {
    if (loading) return;
    try {
      if (!soundRef.current) {
        setLoading(true);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true },
        );
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((s) => {
          if (!s.isLoaded) return;
          if (s.didJustFinish) {
            setPlaying(false);
            sound.setPositionAsync(0).catch(() => {});
          } else {
            setPlaying(s.isPlaying ?? false);
          }
        });
        setPlaying(true);
        setLoading(false);
        return;
      }

      const st = await soundRef.current.getStatusAsync();
      if (!st.isLoaded) return;
      if (st.isPlaying) {
        await soundRef.current.pauseAsync();
        setPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setPlaying(true);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <Pressable
      style={localStyles.row}
      onPress={toggle}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="تشغيل أو إيقاف التسجيل الصوتي"
    >
      {loading ? (
        <ActivityIndicator color={Theme.colors.primary} />
      ) : (
        <Ionicons
          name={playing ? "pause-circle" : "play-circle"}
          size={40}
          color={Theme.colors.primary}
        />
      )}
      <Text style={localStyles.text}>
        {playing ? "إيقاف مؤقت" : "تشغيل التسجيل الصوتي"}
      </Text>
    </Pressable>
  );
}

const localStyles = StyleSheet.create({
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    marginTop: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Theme.colors.textPrimary,
    textAlign: "right",
  },
});
