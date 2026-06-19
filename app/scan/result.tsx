import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const BG = "#101415";
const SURFACE = "#1a2023";
const SURFACE_ALT = "#20282b";
const TEAL = "#4fb5a7";
const RED = "#d95353";
const WHITE = "#f5fbf9";
const MUTED = "#bbcac5";

type ProfileLike = {
  name?: string;
  bloodType?: string;
  emergencyContact?: string;
  allergies?: string[];
  conditions?: string[];
  threatLevel?: "high" | "medium" | "low" | string;
  reason?: string;
  flaggedBy?: string;
  lastSeen?: string;
  description?: string;
  guardianContact?: string;
  enrolledAt?: string;
  status?: string;
  type?: string;
  [key: string]: unknown;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function toDisplayValue(value: unknown) {
  if (typeof value === "string") {
    return value.trim().length > 0 ? value : null;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

export default function ScanResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    matched?: string;
    confidence?: string;
    profile?: string;
    camera?: string;
    timestamp?: string;
  }>();

  let profile: ProfileLike | null = null;
  if (params.profile) {
    try {
      profile = JSON.parse(params.profile) as ProfileLike;
    } catch {
      profile = null;
    }
  }

  const confidenceValue = Number.parseFloat(params.confidence ?? "");
  const confidence = Number.isFinite(confidenceValue)
    ? confidenceValue.toFixed(1)
    : params.confidence ?? "0.0";
  const camera = params.camera ?? "Active scan";

  const name =
    typeof profile?.name === "string" && profile.name.trim().length > 0
      ? profile.name
      : "Matched profile";
  const initials = getInitials(name) || "MP";

  const dataCards = [
    {
      key: "bloodType",
      label: "Blood Type",
      value: toDisplayValue(profile?.bloodType),
      emphasis: true,
    },
    {
      key: "emergencyContact",
      label: "Emergency Contact",
      value: toDisplayValue(profile?.emergencyContact),
    },
    {
      key: "allergies",
      label: "Known Allergies",
      value: Array.isArray(profile?.allergies)
        ? profile.allergies.filter(Boolean).join(", ")
        : null,
      critical: true,
    },
    {
      key: "conditions",
      label: "Conditions",
      value: Array.isArray(profile?.conditions)
        ? profile.conditions.filter(Boolean).join(", ")
        : null,
    },
    {
      key: "threatLevel",
      label: "Threat Level",
      value: toDisplayValue(profile?.threatLevel)?.toUpperCase() ?? null,
      critical: true,
    },
    {
      key: "reason",
      label: "Reason",
      value: toDisplayValue(profile?.reason),
      critical: true,
    },
    {
      key: "flaggedBy",
      label: "Flagged By",
      value: toDisplayValue(profile?.flaggedBy),
    },
    {
      key: "lastSeen",
      label: "Last Seen",
      value: toDisplayValue(profile?.lastSeen),
    },
    {
      key: "description",
      label: "Description",
      value: toDisplayValue(profile?.description),
    },
    {
      key: "guardianContact",
      label: "Guardian Contact",
      value: toDisplayValue(profile?.guardianContact),
    },
    {
      key: "enrolledAt",
      label: "Enrolled",
      value: toDisplayValue(profile?.enrolledAt),
    },
    {
      key: "status",
      label: "Status",
      value: toDisplayValue(profile?.status),
    },
    {
      key: "type",
      label: "Profile Type",
      value: toDisplayValue(profile?.type),
    },
  ].filter((card) => card.value !== null && card.value !== "");

  const prominentCard = dataCards.find((card) => card.key === "bloodType");
  const secondaryCards = dataCards.filter((card) => card.key !== "bloodType");

  return (
    <View style={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Scan again</Text>
      </Pressable>

      <View style={styles.headerBlock}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.matchText}>MATCH FOUND</Text>
        <Text style={styles.confidenceText}>
          {confidence}% confidence · {camera}
        </Text>
      </View>

      <View style={styles.profileBlock}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        {profile?.type || profile?.status ? (
          <Text style={styles.metaText}>
            {[profile?.type, profile?.status].filter(Boolean).join(" · ")}
          </Text>
        ) : null}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MEDICAL PROFILE</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {prominentCard ? (
          <View style={[styles.card, styles.prominentCard]}>
            <Text style={styles.cardLabel}>{prominentCard.label}</Text>
            <Text style={styles.bloodType}>{String(prominentCard.value)}</Text>
          </View>
        ) : null}

        {secondaryCards.map((card) => (
          <View key={card.key} style={styles.card}>
            <Text
              style={[
                styles.cardLabel,
                card.critical ? styles.criticalLabel : null,
              ]}
            >
              {card.label}
            </Text>
            <Text
              style={[
                styles.cardValue,
                card.critical ? styles.criticalValue : null,
              ]}
            >
              {String(card.value)}
            </Text>
          </View>
        ))}
      </View>

      {dataCards.length === 0 ? (
        <Text style={styles.emptyState}>
          No additional profile fields returned by the API.
        </Text>
      ) : null}

      <Pressable style={styles.ctaButton} onPress={() => {}}>
        <Text style={styles.ctaText}>Call emergency contact</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 28,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 18,
  },
  backText: {
    color: MUTED,
    fontSize: 14,
    fontFamily: "monospace",
    letterSpacing: 0.5,
  },
  headerBlock: {
    alignItems: "center",
    marginBottom: 18,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#143a33",
    borderWidth: 2,
    borderColor: "#6dc8ba",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  checkmark: {
    color: "#6dc8ba",
    fontSize: 46,
    lineHeight: 46,
    fontWeight: "700",
  },
  matchText: {
    color: TEAL,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 2,
    fontFamily: "monospace",
    marginBottom: 8,
  },
  confidenceText: {
    color: MUTED,
    fontSize: 13,
    fontFamily: "monospace",
    letterSpacing: 0.8,
  },
  profileBlock: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "#347e73",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    color: "#dffcf6",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 1,
  },
  name: {
    color: WHITE,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  metaText: {
    color: MUTED,
    fontSize: 13,
    marginBottom: 10,
    fontFamily: "monospace",
    letterSpacing: 0.4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(79, 181, 167, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(79, 181, 167, 0.26)",
  },
  badgeText: {
    color: TEAL,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    fontFamily: "monospace",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
  },
  card: {
    width: "48%",
    minHeight: 116,
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  prominentCard: {
    backgroundColor: SURFACE_ALT,
    borderColor: "rgba(79,181,167,0.18)",
  },
  cardLabel: {
    color: MUTED,
    fontSize: 12,
    fontFamily: "monospace",
    letterSpacing: 1,
    marginBottom: 12,
  },
  cardValue: {
    color: WHITE,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  bloodType: {
    color: TEAL,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: 1,
  },
  criticalLabel: {
    color: "#ffb3b3",
  },
  criticalValue: {
    color: RED,
  },
  ctaButton: {
    marginTop: "auto",
    width: "100%",
    borderRadius: 18,
    backgroundColor: TEAL,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: BG,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },
  emptyState: {
    marginTop: 18,
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "monospace",
    textAlign: "center",
  },
});
