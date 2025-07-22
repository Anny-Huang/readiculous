import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import Header from "../../components/header_item";
import { StyleSheet } from "react-native";

export default function Dashboard() {
  const [fullName, setFullName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/"); // Redirect to login if not authenticated
        return;
      }
      const { data, error: detailsError } = await supabase
        .from("user_details")
        .select("first_name, last_name")
        .eq("uuid", user.id)
        .single();

      if (!detailsError && data) {
        const full = `${data.first_name} ${data.last_name}`;
        setFullName(full);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/"); // Redirect to login if logged out
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const assessments = [
  "Mobile Assignment 1",
  "Mobile Assignment 2",
  "DataBase Project",
];

  const tasks = [
    "Review database module 4",
    "add filter to myLab",
  ];

  const totalTodos = assessments.length + tasks.length;

  return (
    <View style={{ flex: 1 }}>
      <Header title="Readiculous" showLogout />
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginTop: 20,
          textAlign: "center",
        }}
      >
        {fullName ? `Welcome, ${fullName}!` : "Welcome to our new app!"}
      </Text>
      {/* Todo Count */}
      <Text style={styles.todoHeader}>You Have</Text>
      <Text style={styles.todoCount}>{totalTodos}</Text>
      <Text style={styles.todoSubtext}>To-Dos Today.</Text>

      {/* Assessment & Task List */}
      <View style={styles.todoCard}>
        <Text style={styles.sectionHeader}>Assessment</Text>
        {assessments.map((item, index) => (
          <Text key={index} style={styles.todoItem}>
            {item}
          </Text>
        ))}

        <Text style={styles.sectionHeader}>Task</Text>
        {tasks.map((item, index) => (
          <Text key={index} style={styles.todoItem}>
            {item}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DCEEFF",
    alignItems: "center",
    paddingTop: 60,
  },
  banner: {
    flexDirection: "row",
    backgroundColor: "#BFDDFD",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  todoHeader: {
    fontSize: 20,
    fontWeight: "600",
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
    marginHorizontal:20
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