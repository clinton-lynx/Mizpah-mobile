import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Camera } from "lucide-react-native";

import { mockProfiles } from "../../lib/mockData";
import type { Profile } from "../../types";

const TEAL = "#4fb5a7";
const BG = "#101415";
const MUTED = "#9aa7a3";

function CornerBracket({
  position,
  loading,
  pulse,
}: {
  position:
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight";
  loading: boolean;
  pulse: Animated.Value;
}) {
  const cornerStyles = {
    topLeft: styles.cornerTopLeft,
    topRight: styles.cornerTopRight,
    bottomLeft: styles.cornerBottomLeft,
    bottomRight: styles.cornerBottomRight,
  };

  return (
    <Animated.View
      style={[
        styles.corner,
        cornerStyles[position],
        loading && {
          opacity: pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.75, 1],
          }),
          transform: [
            {
              scale: pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.94, 1],
              }),
            },
          ],
        },
      ]}
    />
  );
}

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const scanPulse = useRef(new Animated.Value(0)).current;
  const statusPulse = useRef(new Animated.Value(0)).current;
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    if (isScanning) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanPulse, {
            toValue: 1,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanPulse, {
            toValue: 0,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }

    scanPulse.setValue(0);
    return undefined;
  }, [isScanning, scanPulse]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(statusPulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(statusPulse, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [statusPulse]);

  const handleScan = () => {
    if (!permission?.granted || isScanning) {
      return;
    }

    setIsScanning(true);
    if (scanTimer.current) {
      clearTimeout(scanTimer.current);
    }

    scanTimer.current = setTimeout(() => {
      const profile: Profile = mockProfiles[0];
      setIsScanning(false);
      router.push({
        pathname: "/scan/result",
        params: {
          matched: "true",
          confidence: "94.8",
          profile: JSON.stringify(profile),
          camera: "Gate A",
          timestamp: "Just now",
        },
      });
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (scanTimer.current) {
        clearTimeout(scanTimer.current);
      }
    };
  }, []);

  const statusLabel = isScanning ? "SCANNING..." : "READY";
  const idlePulse = useRef(new Animated.Value(0)).current;
  const bracketPulse = isScanning ? scanPulse : idlePulse;

  if (!permission) {
    return <View style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.screen}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.logo}>MIZPAH</Text>
            <Text style={styles.subtitle}>Active Scan</Text>
          </View>
          <Text style={styles.statusDenied}>CAMERA ACCESS REQUIRED</Text>
        </View>
        <View style={styles.deniedCard}>
          <Text style={styles.deniedText}>Camera access required</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.logo}>MIZPAH</Text>
          <Text style={styles.subtitle}>Active Scan</Text>
        </View>
        <View style={styles.statusWrap}>
          <Animated.View
            style={[
              styles.statusDot,
              {
                opacity: statusPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.65, 1],
                }),
                transform: [
                  {
                    scale: statusPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1.04],
                    }),
                  },
                ],
              },
            ]}
          />
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.cameraSection}>
        <View style={styles.viewfinder}>
          <CameraView style={StyleSheet.absoluteFill} facing="back" />
          <View style={styles.overlay} />

          <CornerBracket position="topLeft" loading={isScanning} pulse={bracketPulse} />
          <CornerBracket position="topRight" loading={isScanning} pulse={bracketPulse} />
          <CornerBracket position="bottomLeft" loading={isScanning} pulse={bracketPulse} />
          <CornerBracket position="bottomRight" loading={isScanning} pulse={bracketPulse} />

          <View style={styles.centerLabelWrap}>
            <Text style={styles.centerLabel}>Point camera at face</Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={handleScan}
        style={({ pressed }) => [
          styles.scanButton,
          pressed && !isScanning ? styles.scanButtonPressed : null,
          isScanning ? styles.scanButtonScanning : null,
        ]}
      >
        <Camera color={BG} size={30} strokeWidth={2.4} />
      </Pressable>

      <Text style={styles.tapText}>{isScanning ? "Scanning..." : "Tap to scan"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 32,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  logo: {
    color: TEAL,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 3,
    fontFamily: "monospace",
  },
  subtitle: {
    marginTop: 6,
    color: "#d7e4df",
    fontSize: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "monospace",
  },
  statusWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TEAL,
  },
  statusText: {
    color: TEAL,
    fontSize: 13,
    letterSpacing: 2,
    fontFamily: "monospace",
  },
  statusDenied: {
    color: "#ff8a8a",
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: "monospace",
    marginTop: 10,
  },
  cameraSection: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  viewfinder: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#182024",
    borderWidth: 1,
    borderColor: "rgba(79, 181, 167, 0.18)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16, 20, 21, 0.22)",
  },
  corner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: TEAL,
  },
  cornerTopLeft: {
    top: 18,
    left: 18,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 18,
    right: 18,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 18,
    left: 18,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 18,
    right: 18,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  centerLabelWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    alignItems: "center",
    marginTop: -10,
  },
  centerLabel: {
    color: "#d7e4df",
    fontSize: 15,
    letterSpacing: 1.5,
    fontFamily: "monospace",
  },
  scanButton: {
    alignSelf: "center",
    marginTop: 34,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  scanButtonScanning: {
    opacity: 0.85,
  },
  tapText: {
    textAlign: "center",
    marginTop: 14,
    color: MUTED,
    fontSize: 14,
    letterSpacing: 1.4,
    fontFamily: "monospace",
  },
  deniedCard: {
    marginTop: 60,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  deniedText: {
    color: "#d7e4df",
    fontSize: 16,
    fontFamily: "monospace",
  },
});
