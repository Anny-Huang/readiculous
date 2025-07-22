// components/SignInForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import Header from "./header_item";
import authFormStyles from "./styles";

interface SignInFormProps {
  setIsLoggedIn?: (isLoggedIn: boolean) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Error",
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error || !data.user) {
      Alert.alert("Error", error?.message ?? "Login failed.");
      return;
    }

    // Insert user details only if not already present
    const user = data.user;
    const { data: existing, error: fetchError } = await supabase
      .from("user_details")
      .select("uuid")
      .eq("uuid", user.id)
      .single();

    if (!existing) {
      const { first_name, last_name } = user.user_metadata;

      const { error: insertError } = await supabase.from("user_details").insert({
        uuid: user.id,
        email: user.email,
        first_name,
        last_name,
      });

      if (insertError) {
        console.error("Failed to insert user_details:", insertError.message);
      }
    }

    if (setIsLoggedIn) setIsLoggedIn(true);
    router.replace("/(tabs)");
  };

  return (
    <LinearGradient colors={["#f0f8ff", "#44a0fcff"]} style={authFormStyles.gradient}>
      <View style={authFormStyles.container}>
        <Header title="Readiculous" />
        <ScrollView contentContainerStyle={authFormStyles.innerContainer}>
          <Text style={authFormStyles.title}>Log In</Text>
          <View style={authFormStyles.card}>
            <View style={authFormStyles.inputWrapper}>
              <Text style={authFormStyles.label}>Email:</Text>
              <TextInput
                placeholder="Please enter Email"
                placeholderTextColor="#888"
                style={authFormStyles.input}
                value={email}
                onChangeText={(text) => setEmail(text.trim())}
                keyboardType="email-address"
              />
            </View>

            <View style={authFormStyles.inputWrapper}>
              <Text style={authFormStyles.label}>Password:</Text>
              <TextInput
                placeholder="Please enter Password"
                placeholderTextColor="#888"
                style={authFormStyles.input}
                secureTextEntry
                value={password}
                onChangeText={(text) => setPassword(text)}
                autoCorrect={false}
              />
            </View>

            <Pressable style={authFormStyles.button} onPress={handleLogin}>
              <Text style={authFormStyles.buttonText}>Sign In</Text>
            </Pressable>

            <Pressable style={{ marginTop: 15 }} onPress={() => router.push("/signup")}>
              <Text style={authFormStyles.linkText}>Create a new account?</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

export default SignInForm;
