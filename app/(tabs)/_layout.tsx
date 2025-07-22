import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "assessment") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "task") {
            iconName = focused ? "list" : "list-outline";
          } else {
            iconName = "ellipse"; // fallback icon
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="assessment" options={{ title: "Assessment" }} />
      <Tabs.Screen name="task" options={{ title: "Task" }} />
    </Tabs>
  );
}
