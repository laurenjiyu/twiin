import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

// Predefined emoji list
const emojiList = ["😸", "😹", "🙀", "😻", "😿", "❤️", "🤬", "👏", "👍", "👎"];

const EmojiPicker = ({ visible, onClose, onSelect, position }) => {
  if (!visible) return null;

  return (
    <View
      style={[
        styles.container,
        position && {
          top: position.y,
          left: position.x,
        },
      ]}
    >
      <View style={styles.pickerContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {emojiList.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={styles.emojiButton}
              onPress={() => {
                onSelect(emoji);
                onClose();
              }}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8, // Reduced padding
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 4,
  },
  emojiButton: {
    padding: 1, // Reduced padding
    marginHorizontal: 2, // Reduced margin
  },
  emojiText: {
    fontSize: 22, // Slightly smaller emoji size
  },
});

export default EmojiPicker;
