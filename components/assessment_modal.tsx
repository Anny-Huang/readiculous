import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { scheduleNotification } from "../lib/notifications";
import DateTimeField from "../components/DateTimeField";

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
  onDelete?: () => Promise<void>;
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

  useEffect(() => {
    setTitle(initialValues?.title || "");
    setDueTime(initialValues?.due_time || "");
    setReminder(initialValues?.reminder_time || "");
    setSubject(initialValues?.subject || "");
    setDescription(initialValues?.description || "");
  }, [initialValues, visible]);

  const handleSubmit = async () => {
    if (!title || !dueTime || !subject) {
      Alert.alert("Missing required fields");
      return;
    }

    await onSubmit({
      title,
      due_time: dueTime,
      reminder_time: reminder,
      subject,
      description,
    });

    if (reminder) {
      const reminderDate = new Date(reminder);
      const now = new Date();

      if (reminderDate.getTime() <= now.getTime()) {
        Alert.alert("Reminder is in the past. No notification scheduled.");
      } else {
        try {
          await scheduleNotification(
            "Assessment Reminder",
            `Reminder for assessment: ${title}`,
            reminderDate
          );
          Alert.alert("✅ Reminder notification scheduled!");
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
        <Text style={styles.heading}>{isEdit ? "Edit" : "New"} Assessment</Text>

        <TextInput
          placeholder="Title"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <DateTimeField label="Due" value={dueTime} onChange={setDueTime} />

        <DateTimeField
          label="Reminder"
          value={reminder}
          onChange={setReminder}
          compareTo={dueTime}
          mustBeBefore
        />

        <TextInput
          placeholder="Subject"
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
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
