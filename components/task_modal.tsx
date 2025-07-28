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
} from "react-native";
import { scheduleNotification } from "../lib/notifications";
import DateTimeField from "../components/DateTimeField";  // ✅ import reusable field

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

    // Save task data
    await onSubmit({
      title,
      reminder_time: reminder,
      description,
    });

    // ✅ Only schedule notification if reminder is in the future
    if (reminder) {
      const reminderDate = new Date(reminder);
      const now = new Date();

      if (reminderDate.getTime() <= now.getTime()) {
        Alert.alert("Reminder is in the past. No notification scheduled.");
      } else {
        try {
          await scheduleNotification(
            "Task Reminder",
            `Reminder for task: ${title}`,
            reminderDate
          );
          Alert.alert("✅ Notification scheduled!");
        } catch (err) {
          Alert.alert("❌ Failed to schedule notification.");
        }
      }
    }

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.heading}>{isEdit ? "Edit" : "New"} Task</Text>

        <TextInput
          placeholder="Title"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        {/* ✅ Replace old picker with DateTimeField */}
        <DateTimeField
          label="Reminder"
          value={reminder}
          onChange={(date) => setReminder(date)}
          mustBeBefore={false}   // Only enforce future time, not before due date
        />

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
      </View>
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
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});
