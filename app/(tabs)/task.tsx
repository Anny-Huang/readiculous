import { View, Text,TextInput, Button, ScrollView, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import Header from "../../components/header_item";

export default function Task() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [reminder, setReminder] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    const newTask = { title, reminder, description };
    setTasks([...tasks, newTask]);
    setTitle(""); setReminder(""); setDescription("");
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Header title="Readiculous" showLogout />
      <Text style={styles.heading}>Task</Text>

      <TextInput placeholder="Title" style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput placeholder="Reminder Time" style={styles.input} value={reminder} onChangeText={setReminder} />
      <TextInput
        placeholder="Description"
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Button title="Add Task" onPress={handleAdd} />

      <ScrollView style={{ marginTop: 16 }}>
        {tasks.map((task, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.title}>{task.title}</Text>
            <Text>Reminder: {task.reminder}</Text>
            <Text>{task.description}</Text>
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