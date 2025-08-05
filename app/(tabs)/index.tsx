// Dashboard.tsx
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import Header from "../../components/header_item";
import TaskFormModal from "../../components/task_modal";
import AssessmentFormModal from "../../components/assessment_modal";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "react-native/Libraries/NewAppScreen";

const themeColor = "#1c3f75";

function capitalizeWords(name: string) {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Dashboard() {
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [todayAssessments, setTodayAssessments] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [assessmentModalVisible, setAssessmentModalVisible] = useState(false);

  const router = useRouter();

  const isToday = (iso) => {
    const date = new Date(iso);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/");
        return;
      }
      setUserId(user.id);
      const { data, error } = await supabase
        .from("user_details")
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .single();
      if (!error && data) {
        const full = `${data.first_name} ${data.last_name}`;
        setFullName(capitalizeWords(full));
      }
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.replace("/");
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    if (!userId) return;

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("completed", false);

    const todayTasks =
      tasks?.filter((t) => t.reminder_time && isToday(t.reminder_time)) || [];

    const { data: assessments } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", userId);

    const todayAssessments =
      assessments?.filter((a) => a.due_time && isToday(a.due_time)) || [];

    setTodayTasks(todayTasks);
    setTodayAssessments(todayAssessments);
  };

  useEffect(() => {
    if (!userId) return;
    fetchData();

    const tasksChannel = supabase
      .channel("realtime-tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        fetchData
      )
      .subscribe();

    const assessmentsChannel = supabase
      .channel("realtime-assessments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assessments" },
        fetchData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(assessmentsChannel);
    };
  }, [userId]);

  const totalTodos = todayTasks.length + todayAssessments.length;

  return (
    <View style={{ flex: 1 }}>
      <Header title="Readiculous" showLogout />

      <LinearGradient
        colors={["#f0f8ff", "#44a0fcff"]}
        style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}
      >
        <View style={styles.titleviewcard}>
          <View style={styles.welcomeRow}>
            <Ionicons
              name="happy-outline"
              size={28}
              color={themeColor}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.welcomemsg}>
              {fullName ? `Welcome ${fullName} !` : "Welcome!"}
            </Text>
          </View>
        </View>

        <Text style={styles.todoHeader}>You Have</Text>
        <Text style={styles.todoCount}>{totalTodos}</Text>
        <Text style={styles.todoSubtext}>To-Dos Today.</Text>

        <View style={styles.todoCard}>
          <ScrollView style={{ maxHeight: "100%" }}>
            {/* Assessments Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>📚 Assessment</Text>
            </View>
            {todayAssessments.length === 0 ? (
              <Text style={styles.todoItem}>None</Text>
            ) : (
              todayAssessments.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => {
                    setSelectedAssessment(a);
                    setAssessmentModalVisible(true);
                  }}
                >
                  <View style={styles.todoItemRow}>
                    <Text style={styles.todoItemText}>{a.title}</Text>
                     <Text>⌛ {new Date(a.due_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  </Text>
                  </View>
                  <View style={styles.divider} />
                </Pressable>
              ))
            )}

            {/* Tasks Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>📝 Task</Text>
            </View>
            {todayTasks.length === 0 ? (
              <Text style={styles.todoItem}>None</Text>
            ) : (
              todayTasks.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => {
                    setSelectedTask(t);
                    setModalVisible(true);
                  }}
                >
                  <View style={styles.todoItemRow}>
                    <Text style={styles.todoItemText}>{t.title}</Text>
                    <Text>⌛ {new Date(t.reminder_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  <View style={styles.divider} />
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Assessment Modal */}
      <AssessmentFormModal
        visible={assessmentModalVisible}
        initialValues={selectedAssessment || undefined}
        onClose={() => {
          setAssessmentModalVisible(false);
          setSelectedAssessment(null);
        }}
        onSubmit={async (data) => {
          if (!selectedAssessment) return;
          await supabase
            .from("assessments")
            .update({
              ...data,
              due_time: data.due_time ? new Date(data.due_time) : null,
            })
            .eq("id", selectedAssessment.id);
          fetchData();
        }}
        onDelete={async () => {
          if (!selectedAssessment) return;
          await supabase
            .from("assessments")
            .delete()
            .eq("id", selectedAssessment.id);
          setAssessmentModalVisible(false);
          setSelectedAssessment(null);
          fetchData();
        }}
      />

      {/* Task Modal */}
      <TaskFormModal
        visible={modalVisible}
        initialValues={selectedTask || undefined}
        onClose={() => {
          setModalVisible(false);
          setSelectedTask(null);
        }}
        onSubmit={async (data) => {
          if (!selectedTask) return;
          await supabase
            .from("tasks")
            .update({
              ...data,
              reminder_time: data.reminder_time ? new Date(data.reminder_time) : null,
            })
            .eq("id", selectedTask.id);
          fetchData();
        }}
        onDelete={async () => {
          if (!selectedTask) return;
          await supabase
            .from("tasks")
            .delete()
            .eq("id", selectedTask.id);
          setModalVisible(false);
          setSelectedTask(null);
          fetchData();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  todoHeader: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 10,
  },
  titleviewcard: {
    backgroundColor: "#B6D3FF",
    borderRadius: 15,
    paddingVertical: 2,
    paddingHorizontal: 5,
    marginVertical: 10,
    width: "50%",
    alignSelf: "center",
  },
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  welcomemsg: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  todoCount: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#267dffff",
    textAlign: "center",
  },
  todoSubtext: {
    fontSize: 22,
    marginBottom: 15,
    textAlign: "center",
  },
  todoCard: {
    backgroundColor: "white",
    width: "95%",
    height: "55%",
    padding: 16,
    borderRadius: 30,
    borderColor: "#a4c1fbff",
    borderWidth: 2,
    marginHorizontal: 5,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: "700",
    color: themeColor,
    marginLeft: 6,
  },
  todoItemRow: {
    flexDirection: "row",
    justifyContent:"space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  todoItemText: {
    fontSize: 16,
    color: "#1e293b",
    flexShrink: 1,
  },
  todoItem: {
    fontSize: 16,
    paddingVertical: 5,
    color: "#64748b",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 4,
  },
});
