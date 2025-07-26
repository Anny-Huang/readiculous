
// i did download the package for notifications, but i am not using it in this file
// don't forget to finish it
import { View, Text, ScrollView, StyleSheet, Pressable, Button, Alert, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Header from "../../components/header_item";
import TaskForm, { TaskInput } from "../../components/task_modal";
import { Ionicons } from "@expo/vector-icons"; // for checkbox icons
import { requestNotificationPermissions } from "../../lib/notifications"; 
import TestNotificationButton from "../../components/test_notification";

type Task = {
  id: number;
  title: string;
  description?: string;
  reminder_time?: string;
  completed: boolean;
};

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 1. Load user_id once
  useEffect(() => {
    // Request notification permissions
    requestNotificationPermissions();
    const fetchUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUserId();
  }, []);

  // 2. Load tasks for current user
  const fetchTasks = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("reminder_time", { ascending: true });

    if (error) console.error(error);
    else setTasks(data);
  };

  useEffect(() => {
    if (userId) fetchTasks();
  }, [userId]);

  // 3. Open modal to add new task
  const openNew = () => {
    setEditingTask(null);
    setModalVisible(true);
  };

  // 4. Open modal to edit a task
  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  // 5. Save (Add or Update)
  const handleSubmit = async (input: TaskInput) => {
    if (!userId) return;

    const payload = {
      ...input,
      user_id: userId,
      reminder_time: input.reminder_time ? new Date(input.reminder_time) : null,
    };

    if (editingTask) {
      // Update task
      const { error } = await supabase
        .from("tasks")
        .update(payload)
        .eq("id", editingTask.id);
      if (error) Alert.alert("Error", error.message);
    } else {
      // Insert new task
      const { error } = await supabase.from("tasks").insert({
        ...payload,
        completed: false, // new tasks default to incomplete
      });
      if (error) Alert.alert("Error", error.message);
    }

    setModalVisible(false);
    setEditingTask(null);
    fetchTasks();
  };

  // 6. Delete a task
  const handleDelete = async () => {
    if (!editingTask) return;
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", editingTask.id);

    if (error) Alert.alert("Error", error.message);
    else {
      setModalVisible(false);
      setEditingTask(null);
      fetchTasks();
      Alert.alert("Deleted", "Task removed.");
    }
  };

  // 7. Toggle completion checkbox
  const toggleCompleted = async (task: Task) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id);

    if (error) Alert.alert("Error", error.message);
    else fetchTasks();
  };

  // 8. Group tasks by reminder date (e.g. "July 2 2025")
  const groupByDate = (items: Task[]) => {
    const grouped: Record<string, Task[]> = {};
    for (let item of items) {
      const date = item.reminder_time
        ? new Date(item.reminder_time).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "No Date";

      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(item);
    }
    return grouped;
  };

  const grouped = groupByDate(tasks);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Header title="Readiculous" showLogout />
      <Text style={styles.heading}>Task List</Text>
      <TestNotificationButton />
      {/* Floating + Add button */}
      <TouchableOpacity style={styles.fab} onPress={openNew}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Grouped list */}
      <ScrollView style={{ marginTop: 16 }}>
        {Object.entries(grouped).map(([date, items]) => (
          <View key={date}>
            <Text style={styles.dateGroup}>{date}</Text>
            {items.map((task) => (
              <Pressable
                key={task.id}
                style={styles.card}
                onPress={() => openEdit(task)}
              >
                <View style={styles.taskRow}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.title,
                        task.completed && { textDecorationLine: "line-through", color: "gray" },
                      ]}
                    >
                      {task.title}
                    </Text>
                    <Text style={styles.description}>{task.description}</Text>
                  </View>
                  <Pressable onPress={() => toggleCompleted(task)}>
                    <Ionicons
                      name={task.completed ? "checkbox" : "square-outline"}
                      size={24}
                      color={task.completed ? "#4CAF50" : "#666"}
                    />
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Modal for add/edit task */}
      <TaskForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        onDelete={editingTask ? handleDelete : undefined}
        initialValues={editingTask ?? undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  dateGroup: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#333",
  },
  card: {
    backgroundColor: "#f6faff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
  },
  description: {
    color: "#666",
    fontSize: 13,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 5,
  },
});
