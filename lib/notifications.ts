import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

export async function requestNotificationPermissions() {
  let token: string | undefined;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("❌ Failed to get push token for push notification!");
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("📱 Notification token:", token);
  } else {
    alert("⚠️ Must use physical device for Push Notifications");
  }
    // Android-specific setup
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}


export async function scheduleNotification(title: string, body: string, trigger: Date | number) {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: trigger instanceof Date ? trigger : { seconds: trigger, repeats: false } as any,
    });

    console.log("✅ Notification scheduled:", id);
    return id;
  } catch (err) {
    console.error("❌ Failed to schedule notification:", err);
    throw err;
  }
}

export async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
  console.log("🛑 Canceled notification:", id);
}


export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log("🛑 All notifications canceled");
}
