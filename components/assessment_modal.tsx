import React, { useState } from "react";
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
import DateTimePickerModal from "react-native-modal-datetime-picker";

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

    onClose();
  };

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleString() : "Not set";

  return (
    <Modal visible={visible} animationType="slide">
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
