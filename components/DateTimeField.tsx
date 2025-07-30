import React, { useState } from "react";
import { View, Text, Pressable, Alert, StyleSheet, Platform } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

type DateTimeFieldProps = {
  label: string;
  value: string;
  onChange: (date: string) => void;
  compareTo?: string;
  mustBeBefore?: boolean;
};

export default function DateTimeField({
  label,
  value,
  onChange,
  compareTo,
  mustBeBefore,
}: DateTimeFieldProps) {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleString() : "Not set";

  const getSmartDefaultTime = (selectedDate: Date) => {
    const now = new Date();
    const defaultTime = new Date(selectedDate);
    if (selectedDate.toDateString() === now.toDateString()) {
      const mins = now.getMinutes();
      const rounded = mins <= 30 ? 30 : 60;
      defaultTime.setHours(now.getHours(), rounded, 0, 0);
    } else {
      defaultTime.setHours(9, 0, 0, 0);
    }
    return defaultTime;
  };

  const handleValidDate = (finalDate: Date) => {
    // 🚨 Past time check
    if (finalDate.getTime() < new Date().getTime()) {
      Alert.alert("Invalid time", "Please select a future time.");
      return;
    }

    // 🚨 Reminder AFTER due time check
    if (mustBeBefore && compareTo) {
      const dueDate = new Date(compareTo);
      if (finalDate.getTime() > dueDate.getTime()) {
        Alert.alert("Invalid time", `${label} must be before the due time.`);
        return;
      }
    }

    // ✅ Only update if valid
    onChange(finalDate.toISOString());
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.pickerButton} onPress={() => setDatePickerVisible(true)}>
        <Text style={styles.pickerText}>{formatDate(value)}</Text>
      </Pressable>

      {/* iOS: ONE datetime picker */}
      {Platform.OS === "ios" && (
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime" // ✅ One-step date+time on iOS
          minimumDate={today}
          display="spinner"
          onConfirm={(date) => {
            handleValidDate(date);
            setDatePickerVisible(false);
          }}
          onCancel={() => setDatePickerVisible(false)}
        />
      )}

      {/* Android: TWO pickers (date → time) */}
      {Platform.OS === "android" && (
        <>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            minimumDate={today}
            display="calendar"
            onConfirm={(date) => {
              setTempDate(date);
              setDatePickerVisible(false);
              setTimePickerVisible(true);
            }}
            onCancel={() => setDatePickerVisible(false)}
          />

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            date={tempDate ? getSmartDefaultTime(tempDate) : undefined}
            onConfirm={(time) => {
              if (tempDate) {
                const finalDate = new Date(tempDate);
                finalDate.setHours(time.getHours());
                finalDate.setMinutes(time.getMinutes());
                handleValidDate(finalDate);
              }
              setTimePickerVisible(false);
            }}
            onCancel={() => setTimePickerVisible(false)}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 5 },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  pickerText: { fontSize: 16, color: "#333" },
});
