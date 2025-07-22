import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import Header from "../../components/header_item";

export default function Task() {
  
  return (
    <View style={{ flex: 1 }}>
      <Header title="Readiculous" showLogout />
    </View>
  );
}