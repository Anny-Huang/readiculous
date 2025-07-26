import React, { useState, useEffect} from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  Button,
  Pressable,
  Alert,
} from "react-native";

// This component uses a datetime picker modal
import DateTimePickerModal from "react-native-modal-datetime-picker";

// Define the shape of data used for creating/updating a task
export type TaskInput = {
  title: string;              // Task title (required)
  reminder_time?: string;     // Optional reminder datetime (ISO string)
  description?: string;       // Optional text description
};

// Props expected by the TaskForm component
type TaskFormProps = {
  visible: boolean;                   // Whether the modal is visible
  onClose: () => void;                // Function to call when closing the modal
  onSubmit: (input: TaskInput) => Promise<void>;  // Called when Save/Update is pressed
  onDelete?: () => Promise<void>;     // Called when Delete is pressed (only if editing)
  initialValues?: TaskInput & { id?: number };    // Optional existing values for editing
};

// Reusable modal form component for adding/editing tasks
export default function TaskForm({
  visible,
  onClose,
  onSubmit,
  onDelete,
  initialValues,
}: TaskFormProps) {
  // Determine whether we're editing an existing task or adding a new one
  const isEdit = !!initialValues;

  // Set up state for the form fields
  const [title, setTitle] = useState(initialValues?.title || "");
  const [reminderTime, setReminderTime] = useState(initialValues?.reminder_time || "");
  const [description, setDescription] = useState(initialValues?.description || "");

  // State to control whether the reminder picker is open
  const [isReminderPickerVisible, setReminderPickerVisible] = useState(false);

  // Reset form fields when modal opens or task changes
  useEffect(() => {
    // If editing, fill fields with initial values; otherwise, clear them
    setTitle(initialValues?.title || "");
    setReminderTime(initialValues?.reminder_time || "");
    setDescription(initialValues?.description || "");
  }, [initialValues, visible]);

  // Handle Save or Update button press
  const handleSubmit = async () => {
    if (!title) {
      Alert.alert("Please enter a title"); // Show error if title is missing
      return;
    }

    // Send form data to parent component
    await onSubmit({
      title,
      reminder_time: reminderTime,
      description,
    });

    // Close modal after submission
    onClose();
  };

  // Convert ISO string into human-readable date/time
  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleString() : "Time Not Selected";

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        {/* Form title */}
        <Text style={styles.heading}>{isEdit ? "Edit Task" : "Add Task"}</Text>

        {/* Title input */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
        />

        {/* Reminder time picker */}
        <Text style={styles.label}>Reminder Time</Text>
        <View style={styles.row}>
          <Text style={styles.reminderText}>{formatDate(reminderTime)}</Text>
          <Pressable
            style={styles.selectBtn}
            onPress={() => setReminderPickerVisible(true)}
          >
            <Text style={styles.selectBtnText}>Select Time</Text>
          </Pressable>
        </View>

        {/* Description field */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Optional"
        />

        {/* Bottom buttons: Cancel, Delete (if editing), Save/Update */}
        <View style={styles.btnRow}>
          <Button title="Cancel" color="gray" onPress={onClose} />

          {/* Only show Delete button if editing */}
          {isEdit && onDelete && (
            <Button
              title="Delete"
              color="crimson"
              onPress={() => {
                Alert.alert("Delete Task?", "This action cannot be undone", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: onDelete,
                  },
                ]);
              }}
            />
          )}

          <Button title={isEdit ? "Update" : "Save"} onPress={handleSubmit} />
        </View>

        {/* The actual reminder datetime picker (pops up separately) */}
        <DateTimePickerModal
          isVisible={isReminderPickerVisible}
          mode="datetime"
          onConfirm={(date) => {
            // When user selects a date, store it in ISO string format
            setReminderTime(date.toISOString());
            setReminderPickerVisible(false);
          }}
          onCancel={() => setReminderPickerVisible(false)}
        />
      </View>
    </Modal>
  );
}

// Styling for layout and controls
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#eaf3ff", // light blue background
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reminderText: {
    flex: 1,
    fontSize: 14,
    color: "#444",
  },
  selectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderColor: "#007AFF",
    borderWidth: 1,
    borderRadius: 6,
  },
  selectBtnText: {
    color: "#007AFF",
    fontSize: 14,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 20,
  },
});
