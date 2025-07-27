import { View, Text, StyleSheet, Pressable, Button } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import Header from "../../components/header_item";
import TaskFormModal from "../../components/task_modal"; // Task modal component
import AssessmentFormModal from "../../components/assessment_modal";
import { LinearGradient } from "expo-linear-gradient";


export default function Dashboard() {
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [todayAssessments, setTodayAssessments] = useState<any[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(false); // Used to manually trigger data reload
// Selected task for editing
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false); // Controls task modal visibility
//select assessment for editing
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);
  const [assessmentModalVisible, setAssessmentModalVisible] = useState(false); // Controls assessment modal visibility

  const router = useRouter();

  // Check if a datetime string is for today
  const isToday = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  // Load user info and listen to auth state changes
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
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

        //console.log("Fetched user_details:", { data, error });

      if (!error && data) {
        setFullName(`${data.first_name} ${data.last_name}`);
      }
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/");
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Refetch tasks and assessments when userId or refresh flag changes
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("completed", false);

      const todayTasks = tasks?.filter(
        (t) => t.reminder_time && isToday(t.reminder_time)
      ) || [];

      const { data: assessments } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", userId);

      const todayAssessments = assessments?.filter(
        (a) => a.due_time && isToday(a.due_time)
      ) || [];

      setTodayTasks(todayTasks);
      setTodayAssessments(todayAssessments);
    };

    fetchData();
  }, [userId, refreshFlag]);

  const totalTodos = todayTasks.length + todayAssessments.length;

  return (
  <View style={{ flex: 1 }}>
    <Header title="Readiculous" showLogout />

    <LinearGradient
      colors={["#f0f8ff", "#44a0fcff"]}
      style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}
    >
      <View
        style={styles.titleviewcard}
      >
        {/* <View style={{ flex:1, width: "100%", alignItems: "center"}}> */}
          <Text style={styles.welcomemsg}>
            {/* show first name in welcome message? */}
            {/* use this: */}
            {/* fullName.split(" ")[0] */}

          {fullName ? `Welcome ${fullName} !` : "Welcome!"}
        </Text>
        {/* </View> */}
      </View>

      <Text style={styles.todoHeader}>You Have</Text>
      <Text style={styles.todoCount}>{totalTodos}</Text>
      <Text style={styles.todoHeader}>To-Dos Today.</Text>

      <View style={{ alignItems: "center", marginVertical: 10 }}>
        <Button title="🔄 REFRESH" onPress={() => setRefreshFlag(!refreshFlag)} />
      </View>

    <View style={styles.todoCard}>
      <Text style={styles.sectionHeader}>Assessment</Text>
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
            <Text style={styles.todoItem}>{a.title}</Text>
          </Pressable>
        ))
      )}

      <Text style={styles.sectionHeader}>Task</Text>
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
            <Text style={styles.todoItem}>{t.title}</Text>
          </Pressable>
        ))
      )}
    </View>
    </LinearGradient>

      {/*the 2 Modals for adding/editing tasks */}

      {/* Modal for editing assessment */}
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

          setRefreshFlag(!refreshFlag);
        }}
        onDelete={async () => {
          if (!selectedAssessment) return;
          await supabase
            .from("assessments")
            .delete()
            .eq("id", selectedAssessment.id);

          setAssessmentModalVisible(false);
          setSelectedAssessment(null);
          setRefreshFlag(!refreshFlag);
        }}
      />
      
      {/* Modal for editing task */}
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

          setRefreshFlag(!refreshFlag);
        }}
        onDelete={async () => {
          if (!selectedTask) return;
          await supabase
            .from("tasks")
            .delete()
            .eq("id", selectedTask.id);

          setModalVisible(false);
          setSelectedTask(null);
          setRefreshFlag(!refreshFlag);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  todoHeader: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 10,
  },
  titleviewcard: {
    backgroundColor: "#B6D3FF",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginVertical: 20,
    width: "90%",
    alignSelf: "center",
  },
  welcomemsg: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center", 
  },
  todoCount: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
  },
  todoSubtext: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  todoCard: {
    backgroundColor: "white",
    width: "90%",
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    marginHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
    marginTop: 10,
    marginBottom: 5,
    borderBottomColor: "#D0D0D0",
    borderBottomWidth: 1,
  },
  todoItem: {
    fontSize: 15,
    paddingVertical: 5,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
});
