import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { requestNotificationPermissions } from "../../lib/notifications";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,        
    shouldShowList: true,          
    shouldPlaySound: true,        
    shouldSetBadge: false,        
    shouldShowInForeground: true,  
  }),
});

export default function TabsLayout() {
  useEffect(() => {
    // Step 2: Request Notification Permission at app start
    requestNotificationPermissions();

    // Step 3: Listener → When user taps notification
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("📲 User tapped notification:", response);

      // 🔜 page redirection?
      // if (response.notification.request.content.data?.screen === "task") {
      //   router.push("/task");
      // }
    });

    return () => subscription.remove();
  }, []);

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
            iconName = "ellipse";
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
