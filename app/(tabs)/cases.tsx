import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { mockProfiles } from "../../lib/mockData";
import type { MatchType, Profile } from "../../types";

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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getAccent(type: MatchType) {
  if (type === "watchlist") return COLORS.red;
  if (type === "missing") return COLORS.amber;
  return COLORS.teal;
}

function getCategoryLabel(type: MatchType) {
  if (type === "watchlist") return "WATCHLIST";
  if (type === "missing") return "MISSING";
  return "MEDICAL";
}

function getMeta(profile: Profile) {
  if (profile.type === "medical") return profile.bloodType ? `Blood type: ${profile.bloodType}` : "Medical profile";
  if (profile.type === "missing") return profile.lastSeen ? `Last seen: ${profile.lastSeen}` : "Missing person";
  return profile.threatLevel ? `Threat level: ${profile.threatLevel}` : "Watchlist profile";
}

export default function CasesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filteredProfiles = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return mockProfiles;
    return mockProfiles.filter((profile) => {
      const haystack = [
        profile.name,
        profile.type,
        profile.bloodType,
        profile.lastSeen,
        profile.threatLevel,
        profile.reason,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [query]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Cases</Text>

      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search cases"
          placeholderTextColor="#6d7b77"
          style={styles.search}
        />
      </View>

      <FlatList
        data={filteredProfiles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const accent = getAccent(item.type);

          return (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: "/cases/[id]",
                  params: { id: item.id },
                })
              }
            >
              <View style={[styles.avatar, { backgroundColor: accent }]}>
                <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
              </View>

              <View style={styles.content}>
                <View style={styles.rowTop}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={[styles.badge, { borderColor: accent }]}>
                    <Text style={[styles.badgeText, { color: accent }]}>
                      {getCategoryLabel(item.type)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.meta}>{getMeta(item)}</Text>
              </View>

              <ChevronRight color="#7f8b87" size={20} />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No cases found</Text>
          </View>
        }
      />
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
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 16,
  },
  searchWrap: {
    marginBottom: 16,
  },
  search: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 15,
  },
  list: {
    paddingBottom: 28,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowPressed: {
    opacity: 0.88,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    color: COLORS.bg,
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.6,
  },
  content: {
    flex: 1,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  },
  name: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.9,
    fontFamily: "monospace",
  },
  meta: {
    color: COLORS.muted,
    fontSize: 13,
    fontFamily: "monospace",
  },
  empty: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.muted,
    fontFamily: "monospace",
  },
});
