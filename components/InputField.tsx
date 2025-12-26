import React from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import Colors from "./Colors";

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
}

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
}: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        secureTextEntry={secureTextEntry}
        style={styles.input}
      />
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: {
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: Colors.textDark,
  },
});
