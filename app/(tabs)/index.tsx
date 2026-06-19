import { useEffect, useRef, useState, type ElementRef } from "react";
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
import * as ImageManipulator from "expo-image-manipulator";
import { Camera } from "lucide-react-native";

import { scanFace } from "../../lib/api";

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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<
    "neutral" | "success" | "warning" | "error"
  >("neutral");
  const scanPulse = useRef(new Animated.Value(0)).current;
  const statusPulse = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<ElementRef<typeof CameraView> | null>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const clearMessageTimer = () => {
    if (messageTimer.current) {
      clearTimeout(messageTimer.current);
      messageTimer.current = null;
    }
  };

  const showTransientMessage = (
    message: string,
    tone: "neutral" | "success" | "warning" | "error" = "neutral"
  ) => {
    clearMessageTimer();
    setStatusMessage(message);
    setStatusTone(tone);
    messageTimer.current = setTimeout(() => {
      setStatusMessage(null);
      setStatusTone("neutral");
      messageTimer.current = null;
    }, 1800);
  };

  const handleScan = async () => {
    if (!permission?.granted || isScanning) {
      return;
    }

    const camera = cameraRef.current;
    if (!camera) {
      showTransientMessage("Camera is not ready yet", "error");
      return;
    }

    setIsScanning(true);
    clearMessageTimer();
    setStatusMessage(null);

    try {
      const photo = await camera.takePictureAsync({
        base64: true,
        quality: 0.5,
        exif: false,
      });

      if (!photo?.uri) {
        throw new Error("Camera did not return a captured image.");
      }

      let base64Image = photo.base64;

      if (!base64Image || base64Image.length > 700 * 1024) {
        const manipulated = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 600 } }],
          {
            compress: 0.5,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );

        base64Image = manipulated.base64;
      }

      if (!base64Image) {
        throw new Error("Unable to prepare image for scanning.");
      }

      const response = await scanFace(base64Image, "active");

      if (response.matched) {
        router.push({
          pathname: "/scan/result",
          params: {
            matched: "true",
            confidence: String(response.confidence),
            profile: JSON.stringify(response.profile ?? {}),
          },
        });
        return;
      }

      showTransientMessage("No match found", "warning");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatusMessage(message);
      setStatusTone("error");
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      clearMessageTimer();
    };
  }, []);

  const statusLabel = isScanning ? "SCANNING..." : "READY";
  const idlePulse = useRef(new Animated.Value(0)).current;
  const bracketPulse = isScanning ? scanPulse : idlePulse;
  const statusMessageColor =
    statusTone === "error"
      ? "#ff8a8a"
      : statusTone === "warning"
        ? "#d59a34"
        : statusTone === "success"
          ? TEAL
          : MUTED;

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
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
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
      {statusMessage ? (
        <Text style={[styles.messageText, { color: statusMessageColor }]}>
          {statusMessage}
        </Text>
      ) : null}
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
  deniedCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  deniedText: {
    color: MUTED,
    fontSize: 16,
    fontFamily: "monospace",
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
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    color: "#e2ece8",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 1,
    backgroundColor: "rgba(16, 20, 21, 0.5)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  scanButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignSelf: "center",
    marginTop: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TEAL,
    shadowColor: TEAL,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  scanButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  scanButtonScanning: {
    opacity: 0.9,
  },
  tapText: {
    marginTop: 14,
    color: MUTED,
    fontSize: 14,
    fontFamily: "monospace",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  messageText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "monospace",
    letterSpacing: 0.4,
  },
});
