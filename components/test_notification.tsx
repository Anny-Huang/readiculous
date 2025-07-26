//测试1：在10秒内息屏，expo go会进行推送
//测试2：在10秒后息屏，expo go不会进行推送
//测试3：不息屏等待10秒，expo go不会进行推送
//测试4：不息屏等待60秒，expo go不会推送
//测试5：点击测试按钮后立刻息屏，10s后进行推送
//测试6：点击按钮后直接切换到别的app，10s后依然进行推送
//为什么开着expo go就不能推送呢？

//据说是ios的特殊推送规则导致的，安卓上不会有这样的问题
//待会儿请安妮测试这个button好了
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
