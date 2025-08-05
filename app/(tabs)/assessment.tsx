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

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const isDueSoon = (due: string) => {
  const now = new Date();
  const dueTime = new Date(due);
  const diff = dueTime.getTime() - now.getTime();
  return diff > 0 && diff <= 48 * 60 * 60 * 1000; // within 48h
};

const themeColor = "#1c3f75";
const warningColor = "#D63031";

export default function AssessmentPage() {
  const [assessments, setAssessments] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);

  useEffect(() => {
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

  const openNew = () => {
    setEditingAssessment(null);
    setModalVisible(true);
  };

  const openEdit = (assessment) => {
    setEditingAssessment(assessment);
    setModalVisible(true);
  };

  const handleSubmit = async (input: AssessmentInput) => {
    if (!userId) return;

    const payload = {
      ...input,
      user_id: userId,
      due_time: new Date(input.due_time),
      reminder_time: input.reminder_time ? new Date(input.reminder_time) : null,
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
    <LinearGradient colors={["#f0f8ff", "#44a0fcff"]} style={{ flex: 1 }}>
      <Header title="Readiculous" showLogout />

      <View style={styles.titleviewcard}>
        <Text style={styles.pageTitle}>Assessment List</Text>
      </View>

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
                <View style={styles.infoRow}>
                  <Text style={styles.cardTitle}>📚 {a.title}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="book-outline" size={16} color={themeColor} />
                  <Text style={styles.cardSubtitle}>  {a.subject}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={isDueSoon(a.due_time) ? warningColor : themeColor}
                  />
                  <Text style={styles.cardSubtitle}>  {formatDate(a.due_time)}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="notifications-outline" size={16} color={themeColor} />
                  <Text style={styles.cardSubtitle}>  {a.reminder_time ? formatDate(a.reminder_time) : "None"}</Text>
                </View>

                {a.description ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="document-text-outline" size={16} color={themeColor} />
                    <Text style={styles.cardSubtitle}>  {a.description}</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={openNew}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

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
    fontSize: 18,
    color: themeColor,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
    fontWeight:"semibold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    color:themeColor,
  },
  floatingButton: {
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