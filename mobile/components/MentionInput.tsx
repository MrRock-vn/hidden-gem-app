import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Platform,
  Keyboard,
} from "react-native";
import { Colors, Spacing, BorderRadius, Fonts } from "../constants/theme";

interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

interface MentionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  onMentionSelected?: (user: User) => void;
  availableUsers: User[];
  maxHeight?: number;
  style?: any;
}

/**
 * Text input with @mention support and autocomplete dropdown
 */
export function MentionInput({
  value,
  onChangeText,
  placeholder = "Nhập tin nhắn...",
  multiline = true,
  onMentionSelected,
  availableUsers,
  maxHeight = 100,
  style,
}: MentionInputProps) {
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearchText, setMentionSearchText] = useState("");
  const [mentionPosition, setMentionPosition] = useState(0);
  const inputRef = useRef<TextInput>(null);

  // Extract mention search term from text (text after @)
  const extractMentionText = (text: string) => {
    const atIndex = text.lastIndexOf("@");
    if (atIndex === -1) return null;

    const afterAt = text.substring(atIndex + 1);
    // Check if there's a space after @ or if we're at end of text
    const spaceIndex = afterAt.indexOf(" ");

    if (spaceIndex === -1) {
      // No space found, we're still typing the mention
      return afterAt.toLowerCase();
    } else if (spaceIndex === 0) {
      // Space immediately after @, close dropdown
      setShowMentionDropdown(false);
      return null;
    }

    return null;
  };

  // Filter users based on mention search
  const filteredUsers = React.useMemo(() => {
    if (!mentionSearchText) return availableUsers;
    return availableUsers.filter((user) =>
      user.username.toLowerCase().includes(mentionSearchText.toLowerCase()),
    );
  }, [mentionSearchText, availableUsers]);

  const handleTextChange = (text: string) => {
    onChangeText(text);

    const mention = extractMentionText(text);
    if (mention !== null) {
      setMentionSearchText(mention);
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
    }
  };

  const handleMentionSelect = (user: User) => {
    // Find the @ symbol and replace mention with user mention
    const atIndex = value.lastIndexOf("@");
    if (atIndex === -1) return;

    const beforeMention = value.substring(0, atIndex);
    const afterAt = value.substring(atIndex + 1);
    const spaceIndex = afterAt.indexOf(" ");

    let afterMention = "";
    if (spaceIndex !== -1) {
      afterMention = afterAt.substring(spaceIndex);
    }

    const newText = `${beforeMention}@${user.username} ${afterMention}`;
    onChangeText(newText);
    setShowMentionDropdown(false);
    setMentionSearchText("");
    onMentionSelected?.(user);

    // Move cursor to end
    setTimeout(() => {
      inputRef.current?.setNativeProps({
        selection: { start: newText.length, end: newText.length },
      });
    }, 0);
  };

  return (
    <View style={style}>
      <TextInput
        ref={inputRef}
        style={[styles.input, { maxHeight }]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={handleTextChange}
        multiline={multiline}
        scrollEnabled
      />

      {/* Mention Dropdown */}
      <Modal visible={showMentionDropdown} transparent animationType="none">
        <TouchableOpacity
          style={styles.mentionOverlay}
          onPress={() => setShowMentionDropdown(false)}
          activeOpacity={1}
        >
          <View style={styles.mentionDropdown}>
            {filteredUsers.length === 0 ? (
              <View style={styles.mentionEmpty}>
                <Text style={styles.mentionEmptyText}>
                  Không tìm thấy người dùng
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.mentionItem}
                    onPress={() => handleMentionSelect(item)}
                  >
                    <Text style={styles.mentionItemUsername}>
                      @{item.username}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    fontSize: Fonts.sizes.base,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  mentionOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  mentionDropdown: {
    position: "absolute",
    bottom: 60,
    left: Spacing.base,
    right: Spacing.base,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mentionEmpty: {
    padding: Spacing.base,
    alignItems: "center",
  },
  mentionEmptyText: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.sm,
  },
  mentionItem: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  mentionItemUsername: {
    color: Colors.textPrimary,
    fontSize: Fonts.sizes.base,
    fontWeight: "500",
  },
});
