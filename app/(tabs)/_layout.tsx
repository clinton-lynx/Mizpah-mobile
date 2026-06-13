import { Tabs } from "expo-router";
import { Bell, Camera, List } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4fb5a7",
        tabBarInactiveTintColor: "#bbcac5",
        tabBarStyle: {
          backgroundColor: "#1d2022",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          borderTopColor: "#1d2022",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Scan",
          tabBarIcon: ({
            color,
            size,
          }: {
            color: string;
            size: number;
          }) => <Camera color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarBadge: 3,
          tabBarBadgeStyle: {
            backgroundColor: "#d95353",
            color: "#fff",
          },
          tabBarIcon: ({
            color,
            size,
          }: {
            color: string;
            size: number;
          }) => <Bell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          title: "Cases",
          tabBarIcon: ({
            color,
            size,
          }: {
            color: string;
            size: number;
          }) => <List color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
