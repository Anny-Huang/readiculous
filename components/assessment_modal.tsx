import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, Pressable, Modal } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Header from "../components/header_item";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useRouter } from "expo-router";

export default function Assessment() {
  const [assessments, setAssessments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [reminder, setReminder] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState(null);

  // DateTime picker states
  const [isDuePickerVisible, setDuePickerVisible] = useState(false);
  const [isReminderPickerVisible, setReminderPickerVisible] = useState(false);

  const router = useRouter();

  // Load user ID
  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("user_details")
          .select("user_id")
          .eq("user_id", user.id)
          .single();
        if (error) console.error("Failed to get user_id:", error);
        else setUserId(data.user_id);
      }
    };
    fetchUserId();
  }, []);

  // Add new assessment to DB
  const handleAdd = async () => {
    if (!userId) {
      Alert.alert("User not loaded", "Please wait while we fetch user ID.");
      return;
    }
    if (!title || !dueTime || !subject) {
      Alert.alert("Missing required fields");
      return;
    }

    const { error } = await supabase.from("assessments").insert({
      user_id: userId,
      title,
      due_time: new Date(dueTime),
      reminder_time: reminder ? new Date(reminder) : null,
      subject,
      description,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setTitle(""); setDueTime(""); setReminder(""); setSubject(""); setDescription("");
      setModalVisible(false);
      fetchAssessments();
      Alert.alert("Success", "Assessment added successfully.");
    }
  };

  // Fetch all assessments
  const fetchAssessments = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", userId)
      .order("due_time", { ascending: true });

    if (error) console.error(error);
    else setAssessments(data);
  };

  useEffect(() => {
    if (userId) fetchAssessments();
  }, [userId]);

  const formatDate = (iso: string) => iso ? new Date(iso).toLocaleString() : "Not set";

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Header title="Readiculous" showLogout />
      <Text style={styles.heading}>Assessments</Text>

      {/* Open modal to add */}
      <Button title="+" onPress={() => setModalVisible(true)} />

      {/* Modal for add/edit form */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.heading}>New Assessment</Text>

          <TextInput placeholder="Title" style={styles.input} value={title} onChangeText={setTitle} />

          <Pressable style={styles.pickerButton} onPress={() => setDuePickerVisible(true)}>
            <Text style={styles.pickerText}>Due: {formatDate(dueTime)}</Text>
          </Pressable>

          <Pressable style={styles.pickerButton} onPress={() => setReminderPickerVisible(true)}>
            <Text style={styles.pickerText}>Reminder: {formatDate(reminder)}</Text>
          </Pressable>

          <TextInput placeholder="Subject" style={styles.input} value={subject} onChangeText={setSubject} />
          <TextInput placeholder="Description" style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} multiline />

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Button title="Cancel" color="gray" onPress={() => setModalVisible(false)} />
            <Button title="Save" onPress={handleAdd} />
          </View>

          <DateTimePickerModal
            isVisible={isDuePickerVisible}
            mode="datetime"
            onConfirm={(date) => { setDueTime(date.toISOString()); setDuePickerVisible(false); }}
            onCancel={() => setDuePickerVisible(false)}
          />
          <DateTimePickerModal
            isVisible={isReminderPickerVisible}
            mode="datetime"
            onConfirm={(date) => { setReminder(date.toISOString()); setReminderPickerVisible(false); }}
            onCancel={() => setReminderPickerVisible(false)}
          />
        </View>
      </Modal>

      {/* List of assessments */}
      <ScrollView style={{ marginTop: 16 }}>
        {assessments.map((a, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.title}>{a.title}</Text>
            <Text>Subject: {a.subject}</Text>
            <Text>Due: {new Date(a.due_time).toLocaleString()}</Text>
            <Text>Reminder: {a.reminder_time ? new Date(a.reminder_time).toLocaleString() : "None"}</Text>
            <Text>Description: {a.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: "bold", marginVertical: 12 },
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
  card: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: { fontWeight: "bold", fontSize: 16 },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});
