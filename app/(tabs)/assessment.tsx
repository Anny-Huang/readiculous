import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Header from "../../components/header_item";
import AssessmentFormModal, {
  AssessmentInput,
} from "../../components/assessment_modal";
import { requestNotificationPermissions } from "../../lib/notifications";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function AssessmentPage() {
  const [assessments, setAssessments] = useState([]);
  const [userId, setUserId] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);

  // Fetch user ID once
  useEffect(() => {
    // Request notification permissions
    requestNotificationPermissions();
    const fetchUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

  // Load assessments for this user
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

  // Open modal for add
  const openNew = () => {
    setEditingAssessment(null);
    setModalVisible(true);
  };

  // Open modal for edit
  const openEdit = (assessment) => {
    setEditingAssessment(assessment);
    setModalVisible(true);
  };

  // Submit handler (add or update)
  const handleSubmit = async (input: AssessmentInput) => {
    if (!userId) return;

    const payload = {
      ...input,
      user_id: userId,
      due_time: new Date(input.due_time),
      reminder_time: input.reminder_time
        ? new Date(input.reminder_time)
        : null,
    };

    if (editingAssessment) {
      const { error } = await supabase
        .from("assessments")
        .update(payload)
        .eq("id", editingAssessment.id);
      if (error) Alert.alert("Error", error.message);
    } else {
      const { error } = await supabase.from("assessments").insert(payload);
      if (error) Alert.alert("Error", error.message);
    }

    setModalVisible(false);
    setEditingAssessment(null);
    fetchAssessments();
  };

  // Delete handler
  const handleDelete = async () => {
    if (!editingAssessment) return;
    const { error } = await supabase
      .from("assessments")
      .delete()
      .eq("id", editingAssessment.id);

    if (error) Alert.alert("Error", error.message);
    else {
      setModalVisible(false);
      setEditingAssessment(null);
      fetchAssessments();
      Alert.alert("Deleted", "Assessment removed");
    }
  };

  // Group assessments by date
  const groupByDate = (items) => {
    const grouped = {};
    for (let item of items) {
      const date = new Date(item.due_time).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(item);
    }
    return grouped;
  };

  const grouped = groupByDate(assessments);

  return (
    // Gradient background wrapper
    <LinearGradient
      colors={["#f0f8ff", "#44a0fcff"]}
      style={{ flex: 1}}
    >
      <Header title="Readiculous" showLogout />

      {/* Page title */}
      <View style={styles.titleviewcard}>
      <Text style={styles.pageTitle}>Assessment List</Text>
      </View>
      {/* Grouped list */}
      <ScrollView style={{ marginTop: 16 }}>
        {Object.entries(grouped).map(([date, items]) => (
          <View key={date} style={{ marginBottom: 24 }}>
            <Text style={styles.dateGroup}>{date}</Text>
            {(items as any[]).map((a) => (
              <Pressable
                key={a.id}
                style={styles.card}
                onPress={() => openEdit(a)}
              >
                <Text style={styles.cardTitle}>{a.title}</Text>
                <Text style={styles.cardSubtitle}>Subject: {a.subject}</Text>
                <Text style={styles.cardSubtitle}>
                  Due: {new Date(a.due_time).toLocaleString()}
                </Text>
                <Text style={styles.cardSubtitle}>
                  Reminder:{" "}
                  {a.reminder_time
                    ? new Date(a.reminder_time).toLocaleString()
                    : "None"}
                </Text>
                <Text style={styles.cardSubtitle}>
                  Description: {a.description}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Floating button to add new assessment */}
      <TouchableOpacity style={styles.floatingButton} onPress={openNew}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Modal with dynamic behavior */}
      <AssessmentFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        onDelete={editingAssessment ? handleDelete : undefined}
        initialValues={editingAssessment ?? undefined}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  dateGroup: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#333",
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
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 50,
    height: 50,
    backgroundColor: "#4f93ff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
});
