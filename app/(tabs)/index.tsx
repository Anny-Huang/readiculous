// Dashboard.tsx
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import Header from "../../components/header_item";
import TaskFormModal from "../../components/task_modal";
import AssessmentFormModal from "../../components/assessment_modal";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

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
  const [animatedCount, setAnimatedCount] = useState(0);

  const router = useRouter();

  // 🎬 Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const welcomeScale = useRef(new Animated.Value(1)).current;

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

    // 🎬 Delayed entrance animation
    setTimeout(() => {
      const welcomePulse = [];
      for (let i = 0; i < 10; i++) {
        welcomePulse.push(
          Animated.timing(welcomeScale, {
            toValue: 1.1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(welcomeScale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          })
        );
      }

      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 10000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 10000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.sequence(welcomePulse),
      ]).start();
    }, 300);

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

    let current = 0;
    const target = todayTasks.length + todayAssessments.length;
    const interval = setInterval(() => {
      current++;
      setAnimatedCount(current);
      if (current >= target) clearInterval(interval);
    }, 200);

    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 1.03,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (!userId) return;
    fetchData();

    const tasksChannel = supabase
      .channel("realtime-tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => fetchData()
      )
      .subscribe();

    const assessmentsChannel = supabase
      .channel("realtime-assessments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assessments" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(assessmentsChannel);
    };
  }, [userId]);



  return (
    <View style={{ flex: 1 }}>
      <Header title="Readiculous" showLogout />
      <LinearGradient
        colors={["#f0f8ff", "#44a0fcff"]}
        style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}
      >
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY }] }}>
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
          <Text style={styles.todoCount}>{animatedCount}</Text>
          <Text style={styles.todoSubtext}>To-Dos Today.</Text>
        </Animated.View>

        <Animated.View style={[styles.todoCard, { transform: [{ scale: cardScale }] }]}>
          <ScrollView style={{ maxHeight: "100%" }}>
            {/* assessments/tasks list goes here */}
          </ScrollView>
        </Animated.View>
      </LinearGradient>

      {/* Modals (AssessmentFormModal, TaskFormModal) remain unchanged */}
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
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginVertical: 10,
    width: "100%",
    alignSelf: "center",
  },
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  welcomemsg: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  todoCount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#267dffff",
    textAlign: "center",
  },
  todoSubtext: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center",
  },
  todoCard: {
    backgroundColor: "white",
    width: "95%",
    height: "60%",
    padding: 16,
    borderRadius: 30,
    borderColor: "#a4c1fbff",
    borderWidth: 2,
    marginHorizontal: 5,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: themeColor,
    marginTop: 10,
    marginBottom: 6,
    borderBottomColor: themeColor,
    borderBottomWidth: 2,
    paddingBottom: 4,
  },
  todoItemRow: {
    flexDirection: "row",
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
