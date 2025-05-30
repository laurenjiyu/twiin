import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";

const ReactionModal = ({
  visible,
  reactions = [],
  onClose,
  getProfileImage, // function: userId => imageUri (optional)
}) => {
  // Group reactions by emoji
  const grouped = reactions.reduce((acc, r) => {
    acc[r.emoji_id] = acc[r.emoji_id] || [];
    acc[r.emoji_id].push(r);
    return acc;
  }, {});
  const allUsers = reactions;
  const emojiList = Object.keys(grouped);

  const [selectedTab, setSelectedTab] = useState("all");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Reactions ({reactions.length})</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === "all" && styles.tabSelected]}
              onPress={() => setSelectedTab("all")}
            >
              <Text
                style={
                  selectedTab === "all"
                    ? styles.tabTextSelected
                    : styles.tabText
                }
              >
                All
              </Text>
            </TouchableOpacity>
            {emojiList.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.tab,
                  selectedTab === emoji && styles.tabSelected,
                ]}
                onPress={() => setSelectedTab(emoji)}
              >
                <Text
                  style={
                    selectedTab === emoji
                      ? styles.tabTextSelected
                      : styles.tabText
                  }
                >
                  {emoji} {grouped[emoji].length}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* User List */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {selectedTab === "all"
              ? allUsers.map((r, i) => (
                  <View key={i} style={styles.row}>
                    <Image
                      source={{
                        uri: getProfileImage
                          ? getProfileImage(r.user_id)
                          : r.profileImage,
                      }}
                      style={styles.avatar}
                    />
                    <Text style={styles.name}>
                      {r.users?.name || "Unknown"}
                    </Text>
                    <Text style={styles.emojiCol}>{r.emoji_id}</Text>
                  </View>
                ))
              : grouped[selectedTab].map((r, i) => (
                  <View key={i} style={styles.row}>
                    <Image
                      source={{
                        uri: getProfileImage
                          ? getProfileImage(r.user_id)
                          : r.profileImage,
                      }}
                      style={styles.avatar}
                    />
                    <Text style={styles.name}>
                      {r.users?.name || "Unknown"}
                    </Text>
                  </View>
                ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
  },
  closeButton: {
    color: "#007AFF",
    fontSize: 16,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tab: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  tabSelected: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    color: "#333",
    fontWeight: "bold",
  },
  tabTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  list: {
    maxHeight: 300, // About 6 rows, then scroll
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: "#ccc",
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  emojiCol: {
    fontSize: 20,
    marginLeft: 8,
  },
});

export default ReactionModal;
