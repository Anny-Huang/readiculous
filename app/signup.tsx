// components/SignUpForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../components/header_item";
import authFormStyles from "../components/styles";

export default function SignUpForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Error",
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      Alert.alert("Signup failed", error.message);
      return;
    }

    Alert.alert(
      "Almost there!",
      "Please check your email to verify your account before logging in."
    );
    router.replace("/");
  };

  return (
    <LinearGradient colors={["#e6f0ff", "#99ccff"]} style={authFormStyles.gradient}>
      <View style={authFormStyles.container}>
        <Header title="Readiculous" />
        <ScrollView contentContainerStyle={authFormStyles.innerContainer}>
          <Text style={authFormStyles.title}>Sign Up</Text>
          <View style={authFormStyles.card}>
            <View style={authFormStyles.inputWrapper}>
              <Text style={authFormStyles.label}>First Name:</Text>
              <TextInput
                placeholder="Enter first name"
                placeholderTextColor="#888"
                style={authFormStyles.input}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={authFormStyles.inputWrapper}>
              <Text style={authFormStyles.label}>Last Name:</Text>
              <TextInput
                placeholder="Enter last name"
                placeholderTextColor="#888"
                style={authFormStyles.input}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <View style={authFormStyles.inputWrapper}>
              <Text style={authFormStyles.label}>Email:</Text>
              <TextInput
                placeholder="Enter email"
                placeholderTextColor="#888"
                style={authFormStyles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={authFormStyles.inputWrapper}>
              <Text style={authFormStyles.label}>Password:</Text>
              <TextInput
                placeholder="Enter password"
                placeholderTextColor="#888"
                style={authFormStyles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <Pressable style={authFormStyles.button} onPress={handleSignUp}>
              <Text style={authFormStyles.buttonText}>Sign Up</Text>
            </Pressable>

            <Pressable style={{ marginTop: 15 }} onPress={() => router.push("/")}>
              <Text style={authFormStyles.linkText}>Already have an account? Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}
