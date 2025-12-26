import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Colors from "./Colors";

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

const PrimaryButton = ({ title, onPress, disabled }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && { opacity: 0.6 }]}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  text: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
});
