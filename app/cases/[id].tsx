import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { mockProfiles } from "../../lib/mockData";
import type { MatchType, Profile } from "../../types";

const COLORS = {
  bg: "#101415",
  card: "#1a2023",
  cardAlt: "#20282b",
  text: "#f5fbf9",
  muted: "#bbcac5",
  teal: "#4fb5a7",
  amber: "#d59a34",
  red: "#d95353",
  border: "rgba(255,255,255,0.06)",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getAccent(type?: MatchType) {
  if (type === "watchlist") return COLORS.red;
  if (type === "missing") return COLORS.amber;
  return COLORS.teal;
}

function getTypeLabel(type?: MatchType) {
  if (type === "watchlist") return "WATCHLIST";
  if (type === "missing") return "MISSING";
  return "MEDICAL";
}

function renderTypeCards(profile: Profile) {
  if (profile.type === "medical") {
    return [
      {
        label: "Blood Type",
        value: profile.bloodType ?? "-",
        accent: COLORS.teal,
        large: true,
      },
      {
        label: "Emergency Contact",
        value: profile.emergencyContact ?? "-",
      },
      {
        label: "Known Allergies",
        value: profile.allergies?.join(", ") ?? "-",
        accent: COLORS.red,
      },
      {
        label: "Conditions",
        value: profile.conditions?.join(", ") ?? "-",
      },
    ];
  }

  if (profile.type === "watchlist") {
    return [
      {
        label: "Threat Level",
        value: profile.threatLevel ?? "-",
        accent: profile.threatLevel === "high" ? COLORS.red : COLORS.teal,
      },
      {
        label: "Flagged By",
        value: profile.flaggedBy ?? "-",
      },
      {
        label: "Reason",
        value: profile.reason ?? "-",
      },
      {
        label: "Status",
        value: profile.status.toUpperCase(),
      },
    ];
  }

  return [
    {
      label: "Last Seen",
      value: profile.lastSeen ?? "-",
      accent: COLORS.amber,
    },
    {
      label: "Description",
      value: profile.description ?? "-",
    },
    {
      label: "Guardian Contact",
      value: profile.guardianContact ?? "-",
    },
    {
      label: "Status",
      value: profile.status.toUpperCase(),
    },
  ];
}

export default function CaseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const profile = mockProfiles.find((item) => item.id === id);

  if (!profile) {
    return (
      <View style={styles.screen}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.emptyTitle}>Profile not found</Text>
      </View>
    );
  }

  const accent = getAccent(profile.type);
  const cards = renderTypeCards(profile);
  const initials = getInitials(profile.name);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: accent }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <Text style={styles.name}>{profile.name}</Text>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { borderColor: accent }]}>
            <Text style={[styles.badgeText, { color: accent }]}>
              {getTypeLabel(profile.type)}
            </Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{profile.status.toUpperCase()}</Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>ENROLLED {profile.enrolledAt}</Text>
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        {cards.map((card) => (
          <View key={card.label} style={[styles.card, card.large && styles.largeCard]}>
            <Text style={styles.cardLabel}>{card.label}</Text>
            <Text
              style={[
                styles.cardValue,
                card.large && styles.largeValue,
                card.accent ? { color: card.accent } : null,
                card.label === "Known Allergies" ? styles.criticalValue : null,
              ]}
            >
              {card.value}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backText: {
    color: COLORS.muted,
    fontSize: 14,
    fontFamily: "monospace",
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    color: COLORS.bg,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    fontFamily: "monospace",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  statusText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "monospace",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: "48%",
    minHeight: 120,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  largeCard: {
    backgroundColor: COLORS.cardAlt,
  },
  cardLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontFamily: "monospace",
    letterSpacing: 1,
    marginBottom: 12,
  },
  cardValue: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  largeValue: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
  },
  criticalValue: {
    color: COLORS.red,
  },
});
