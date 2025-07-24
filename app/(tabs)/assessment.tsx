import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import Header from "../../components/header_item";

export default function Assessment() {
  const [assessments, setAssessments] = useState([]);
  const [title, setTitle] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [reminder, setReminder] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    const newAssessment = { title, dueTime, reminder, subject, description };
    setAssessments([...assessments, newAssessment]);
    setTitle(""); setDueTime(""); setReminder(""); setSubject(""); setDescription("");
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Header title="Readiculous" showLogout />
      <Text style={styles.heading}>Assessment</Text>

      <TextInput placeholder="Title" style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput placeholder="Due Time" style={styles.input} value={dueTime} onChangeText={setDueTime} />
      <TextInput placeholder="Reminder Time" style={styles.input} value={reminder} onChangeText={setReminder} />
      <TextInput placeholder="Subject" style={styles.input} value={subject} onChangeText={setSubject} />
      <TextInput
        placeholder="Description"
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Button title="Add Assessment" onPress={handleAdd} />

      <ScrollView style={{ marginTop: 16 }}>
        {assessments.map((a, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.title}>{a.title}</Text>
            <Text>Subject: {a.subject}</Text>
            <Text>Due: {a.dueTime}</Text>
            <Text>Reminder: {a.reminder}</Text>
            <Text>{a.description}</Text>
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
  card: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: { fontWeight: "bold", fontSize: 16 },
});