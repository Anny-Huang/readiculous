import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
interface HeaderProps {
  title: string;
  showLogout?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showLogout = true }) => {
  const router = useRouter();

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.replace("/signin");
};


  return (
    <View style={styles.header}>
      <Text>Logo Here</Text>
      <Text style={styles.title}>{title}</Text>
      {showLogout && (
        <Pressable onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    backgroundColor: "#6ab4ffff",
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    color: "black",
    fontFamily: "sans-serif",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,

  },
  logout: {
    fontSize: 16,
  },
});

export default Header;
