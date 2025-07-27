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
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Notifications from "expo-notifications";

// Types for data input & optional initial values
export type AssessmentInput = {
  title: string;
  due_time: string;
  reminder_time?: string;
  subject: string;
  description?: string;
};

type AssessmentFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: AssessmentInput) => Promise<void>;
  onDelete?: () => Promise<void>; // only appears in edit mode
  initialValues?: AssessmentInput & { id?: number };
};

export default function AssessmentFormModal({
  visible,
  onClose,
  onSubmit,
  onDelete,
  initialValues,
}: AssessmentFormModalProps) {
  const isEdit = !!initialValues;

  const [title, setTitle] = useState(initialValues?.title || "");
  const [dueTime, setDueTime] = useState(initialValues?.due_time || "");
  const [reminder, setReminder] = useState(initialValues?.reminder_time || "");
  const [subject, setSubject] = useState(initialValues?.subject || "");
  const [description, setDescription] = useState(initialValues?.description || "");

  const [isDuePickerVisible, setDuePickerVisible] = useState(false);
  const [isReminderPickerVisible, setReminderPickerVisible] = useState(false);

  useEffect(() => {
    setTitle(initialValues?.title || "");
    setDueTime(initialValues?.due_time || "");
    setReminder(initialValues?.reminder_time || "");
    setSubject(initialValues?.subject || "");
    setDescription(initialValues?.description || "");
  }, [initialValues, visible]);

  const handleSubmit = async () => {
    Keyboard.dismiss(); // 👈 Hide the keyboard

    console.log("🟢 handleSubmit called");
    if (!title || !dueTime || !subject) {
      Alert.alert("Missing required fields");
      return;
    }

    // Save assessment data
    await onSubmit({
      title,
      due_time: dueTime,
      reminder_time: reminder,
      subject,
      description,
    });

    if (reminder) {
      console.log("📌 reminder =", reminder);

      const permission = await Notifications.getPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission not granted for notifications");
        onClose();
        return;
      }

      const now = new Date();
      const targetDate = new Date(reminder);
      const diffMs = targetDate.getTime() - now.getTime();
      const diffSec = Math.floor(diffMs / 1000);

      console.log("Now:", now.toString());
      console.log("Reminder:", targetDate.toString());
      console.log("Time diff (sec):", diffSec);

      if (!isNaN(targetDate.getTime()) && diffSec > 0) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Assessment Reminder",
            body: `Reminder for assessment: ${title}`,
          },
          trigger: {
            type: "timeInterval",
            seconds: diffSec,
            repeats: false,
          } as any,
        });

        console.log("✅ Notification scheduled via timeInterval:", id);
        Alert.alert(`Assessment reminder scheduled in ${diffSec} seconds.`);
      } else {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Assessment Reminder (Fallback)",
            body: `Reminder for assessment: ${title}`,
          },
          trigger: {
            type: "timeInterval",
            seconds: 10,
            repeats: false,
          } as any,
        });

        console.log("⚠️ Reminder time invalid or in the past. Fallback ID:", id);
        Alert.alert("Reminder was invalid or in the past. Scheduled fallback in 10 seconds.");
      }
    }

    onClose();
  };

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleString() : "Not set";

  return (
    <Modal visible={visible} animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <Text style={styles.heading}>{isEdit ? "Edit" : "New"} Assessment</Text>

          <TextInput placeholder="Title" style={styles.input} value={title} onChangeText={setTitle} />

          <Pressable style={styles.pickerButton} onPress={() => setDuePickerVisible(true)}>
            <Text style={styles.pickerText}>Due: {formatDate(dueTime)}</Text>
          </Pressable>

          <Pressable style={styles.pickerButton} onPress={() => setReminderPickerVisible(true)}>
            <Text style={styles.pickerText}>Reminder: {formatDate(reminder)}</Text>
          </Pressable>

          <TextInput placeholder="Subject" style={styles.input} value={subject} onChangeText={setSubject} />
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
            isVisible={isDuePickerVisible}
            mode="datetime"
            onConfirm={(date) => {
              setDueTime(date.toISOString());
              setDuePickerVisible(false);
            }}
            onCancel={() => setDuePickerVisible(false)}
          />
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
