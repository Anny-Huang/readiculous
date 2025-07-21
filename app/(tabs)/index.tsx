import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import Header from "../../components/header_item";

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
    </View>
  );
}