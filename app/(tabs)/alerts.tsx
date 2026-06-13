import { useRouter } from "expo-router";
import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";

import { mockAlerts } from "../../lib/mockData";

const COLORS = {
  bg: "#101415",
  card: "#1a2023",
  text: "#f5fbf9",
  muted: "#bbcac5",
  teal: "#4fb5a7",
  amber: "#d59a34",
  red: "#d95353",
  border: "rgba(255,255,255,0.06)",
};

function getTypeLabel(type: string) {
  if (type === "watchlist") return "WATCHLIST MATCH";
  if (type === "missing") return "MISSING PERSON";
  return "MEDICAL PROFILE";
}

function getAccentColor(type: string) {
  if (type === "watchlist") return COLORS.red;
  if (type === "missing") return COLORS.amber;
  return COLORS.teal;
}

export default function AlertsScreen() {
  const router = useRouter();

  const unresolvedCount = mockAlerts.filter(
    (alert) => alert.status === "unresolved"
  ).length;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        <Text style={styles.subtitle}>{unresolvedCount} unresolved</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {mockAlerts.map((alert) => {
          const accent = getAccentColor(alert.profile.type);
          const isResolved = alert.status !== "unresolved";

          return (
            <View key={alert.id} style={[styles.card, { borderLeftColor: accent }]}>
              <View style={styles.topRow}>
                <View style={[styles.badge, { borderColor: accent }]}>
                  <Text style={[styles.badgeText, { color: accent }]}>
                    {getTypeLabel(alert.profile.type)}
                  </Text>
                </View>

                {isResolved ? (
                  <View style={styles.confirmedTag}>
                    <Text style={styles.confirmedText}>Confirmed</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.name}>{alert.profile.name}</Text>
              <Text style={styles.meta}>
                {alert.camera} · {alert.confidence.toFixed(1)}% confidence
              </Text>
              <Text style={styles.timestamp}>{alert.timestamp}</Text>

              {isResolved ? (
                <View style={styles.confirmedPill}>
                  <Text style={styles.confirmedPillText}>Confirmed</Text>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/cases/[id]",
                      params: { id: alert.profile.id },
                    })
                  }
                >
                  <Text style={styles.buttonText}>View profile</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 14,
    fontFamily: "monospace",
    letterSpacing: 0.8,
  },
  list: {
    paddingBottom: 28,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  badgeText: {
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  confirmedTag: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  confirmedText: {
    color: COLORS.muted,
    fontSize: 11,
    letterSpacing: 0.8,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  name: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  meta: {
    color: COLORS.muted,
    fontSize: 14,
    fontFamily: "monospace",
    letterSpacing: 0.2,
  },
  timestamp: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 12,
    fontFamily: "monospace",
  },
  button: {
    marginTop: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: COLORS.teal,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: COLORS.bg,
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.6,
  },
  confirmedPill: {
    marginTop: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  confirmedPillText: {
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
