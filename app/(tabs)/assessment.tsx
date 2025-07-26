import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Button } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Header from "../../components/header_item";
import AssessmentFormModal, { AssessmentInput } from "../../components/assessment_modal";

export default function AssessmentPage() {
  const [assessments, setAssessments] = useState([]);
  const [userId, setUserId] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);

  // Fetch user ID once
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
    <View style={{ flex: 1, padding: 16 }}>
      <Header title="Readiculous" showLogout />
      <Text style={styles.heading}>Assessments</Text>

      {/* Add Button */}
      <Button title="+" onPress={openNew} />

      {/* Grouped list */}
      <ScrollView style={{ marginTop: 16 }}>
        {Object.entries(grouped).map(([date, items]) => (
          <View key={date}>
            <Text style={styles.dateGroup}>{date}</Text>
            {(items as any[]).map((a) => (
              <Pressable key={a.id} style={styles.card} onPress={() => openEdit(a)}>
                <Text style={styles.title}>{a.title}</Text>
                <Text>Subject: {a.subject}</Text>
                <Text>Due: {new Date(a.due_time).toLocaleString()}</Text>
                <Text>Reminder: {a.reminder_time ? new Date(a.reminder_time).toLocaleString() : "None"}</Text>
                <Text>Description: {a.description}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Modal with dynamic behavior */}
      <AssessmentFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        onDelete={editingAssessment ? handleDelete : undefined}
        initialValues={editingAssessment ?? undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: "bold", marginVertical: 12 },
  dateGroup: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#333",
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: { fontWeight: "bold", fontSize: 16 },
});
