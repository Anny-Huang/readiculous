import { View, Button, Alert } from "react-native";
import * as Notifications from "expo-notifications";

export default function TestNotificationButton() {
  const handleTestNotification = async () => {
    const permission = await Notifications.getPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission not granted for notifications");
      
      return;
    }

    const trigger = {
      type: "timeInterval",
      seconds: 10,
      repeats: false,
    } as any;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test push 🔔",
      },
      trigger,
    });

    Alert.alert("Notification scheduled for 10 seconds later!");
  };

  return (
    <View style={{ marginTop: 40 }}>
      <Button title="Send Test Notification" onPress={handleTestNotification} />
    </View>
  );
}
