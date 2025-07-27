import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Modal,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Notifications from "expo-notifications";

export type TaskInput = {
  title: string;
  reminder_time?: string;
  description?: string;
};

type TaskFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: TaskInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialValues?: TaskInput & { id?: number };
};

export default function TaskFormModal({
  visible,
  onClose,
  onSubmit,
  onDelete,
  initialValues,
}: TaskFormModalProps) {
  const isEdit = !!initialValues;

  const [title, setTitle] = useState(initialValues?.title || "");
  const [reminder, setReminder] = useState(initialValues?.reminder_time || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [isReminderPickerVisible, setReminderPickerVisible] = useState(false);

  useEffect(() => {
    setTitle(initialValues?.title || "");
    setReminder(initialValues?.reminder_time || "");
    setDescription(initialValues?.description || "");
  }, [initialValues, visible]);

  const handleSubmit = async () => {
    if (!title) {
      Alert.alert("Missing task title");
      return;
    }

    await onSubmit({
      title,
      reminder_time: reminder,
      description,
    });

    if (reminder) {
      const permission = await Notifications.getPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission not granted for notifications");
        onClose();
        return;
      }

      const now = new Date();
      const localReminderDate = new Date(reminder);
      const diffMs = localReminderDate.getTime() - now.getTime();
      const diffSec = Math.floor(diffMs / 1000);

      if (!isNaN(localReminderDate.getTime()) && diffSec > 0) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Task Reminder",
            body: `Reminder for task: ${title}`,
          },
          trigger: {
            seconds: diffSec,
            repeats: false,
          },
        });

        Alert.alert(`Notification scheduled in ${diffSec} seconds.`);
      } else {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Task Reminder (Fallback)",
            body: `Reminder for task: ${title}`,
          },
          trigger: {
            seconds: 10,
            repeats: false,
          },
        });

        Alert.alert("Reminder was in the past. Fallback scheduled in 10 seconds.");
      }
    }

    onClose();
  };

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleString(undefined, { timeZoneName: "short" }) : "Not set";

  return (
    <Modal visible={visible} animationType="slide">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <Text style={styles.heading}>{isEdit ? "Edit" : "New"} Task</Text>

            <TextInput
              placeholder="Title"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />

            <Pressable
              style={styles.pickerButton}
              onPress={() => setReminderPickerVisible(true)}
            >
              <Text style={styles.pickerText}>Reminder: {formatDate(reminder)}</Text>
            </Pressable>

            <TextInput
              placeholder="Description"
              style={[styles.input, { height: 80 }]}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
              <Button title="Cancel" color="gray" onPress={onClose} />
              {isEdit && onDelete && (
                <Button
                  title="Delete"
                  color="crimson"
                  onPress={() => {
                    Alert.alert("Confirm Delete", "Are you sure?", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: onDelete },
                    ]);
                  }}
                />
              )}
              <Button title={isEdit ? "Update" : "Save"} onPress={handleSubmit} />
            </View>

            <DateTimePickerModal
              isVisible={isReminderPickerVisible}
              mode="datetime"
              onConfirm={(date) => {
                setReminder(date.toISOString());
                setReminderPickerVisible(false);
              }}
              onCancel={() => setReminderPickerVisible(false)}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  pickerText: {
    fontSize: 16,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});
