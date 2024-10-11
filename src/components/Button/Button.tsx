import { TouchableOpacity, Text, StyleSheet } from "react-native";

export interface SafeButtonProps {
  onPress?: () => void;
  text: string;
}

export const SafeButton = ({ onPress, text }: SafeButtonProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "purple",
    borderRadius: 8,
  },
  text: { color: "white" },
});
