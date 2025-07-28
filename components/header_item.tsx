import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

interface HeaderProps {
  title: string;
  showLogout?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showLogout = true }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false); // state for dropdown toggle

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/signin");
    setMenuOpen(false); // close menu after logout
  };

  return (
    <View style={styles.header}>
      {/* Logo */}
      <Image source={require("../assets/logo.png")} style={styles.logo} />

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Menu Button */}
      {showLogout && (
        <View style={{ position: "relative" }}>
          <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
            <Text style={styles.menuButton}>☰</Text>
          </TouchableOpacity>

          {/* Dropdown Menu */}
          {menuOpen && (
            <View style={styles.dropdown}>
              <Pressable style={styles.dropdownItem} onPress={handleLogout}>
                <MaterialIcons
                  name="logout"
                  size={20}
                  color="black"
                  style={styles.icon}
                />
                <Text style={styles.dropdownText}>Logout</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    backgroundColor: "#6ab4ffff",
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  menuButton: {
    fontSize: 28,
    fontWeight: "bold",
    paddingHorizontal: 8,
  },
  dropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "white",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 999,
    minWidth: 120, 
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  icon: {
    marginRight: 8,
  },

  dropdownText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Header;
