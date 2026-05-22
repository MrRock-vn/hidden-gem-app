import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  useComments,
  useCreateComment,
  useLikeComment,
} from "../../../hooks/useSocial";
import UserAvatar from "../../../components/UserAvatar";
import LoadingScreen from "../../../components/LoadingScreen";
import EmptyState from "../../../components/EmptyState";
import { MentionInput } from "../../../components/MentionInput";
import { getUniqueMentionedUsernames } from "../../../services/mentions";
import { Colors, Spacing, BorderRadius, Fonts } from "../../../constants/theme";

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{
    id: string;
    username: string;
  } | null>(null);

  const { data: comments, isLoading, refetch } = useComments(id);
  const createCommentMutation = useCreateComment(id!);
  const likeCommentMutation = useLikeComment(id!);

  // Extract all unique usernames from comments for mention suggestions
  const availableMentionUsers = useMemo(() => {
    const users = new Map();
    comments?.forEach((comment) => {
      if (comment.user) {
        users.set(comment.user.id, {
          id: comment.user.id,
          username: comment.user.username,
          avatar_url: comment.user.avatar_url,
        });
      }
      comment.replies?.forEach((reply) => {
        if (reply.user) {
          users.set(reply.user.id, {
            id: reply.user.id,
            username: reply.user.username,
            avatar_url: reply.user.avatar_url,
          });
        }
      });
    });
    return Array.from(users.values());
  }, [comments]);

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60));
      return `${mins}p`;
    }
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const handleSend = async () => {
    if (!newComment.trim()) return;

    try {
      // Extract mentioned usernames
      const mentionedUsernames = getUniqueMentionedUsernames(newComment);

      await createCommentMutation.mutateAsync({
        content: newComment.trim(),
        parent_id: replyTo?.id,
        mentioned_usernames: mentionedUsernames, // Send to backend for notifications
      });
    } catch {
      // Demo mode - just clear the input
    }

    setNewComment("");
    setReplyTo(null);
  };

  const handleLikeComment = (commentId: string) => {
    likeCommentMutation.mutate(commentId);
  };

  if (isLoading) {
    return <LoadingScreen message="Đang tải bình luận..." />;
  }

  const renderComment = ({ item }: { item: any }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentMain}>
        <UserAvatar
          uri={item.user.avatar_url}
          username={item.user.username}
          size={36}
        />
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUsername}>@{item.user.username}</Text>
            <Text style={styles.commentTime}>
              {getTimeAgo(item.created_at)}
            </Text>
          </View>
          <Text style={styles.commentContent}>{item.content}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity
              style={styles.commentAction}
              onPress={() => handleLikeComment(item.id)}
            >
              <Text style={styles.commentActionText}>
                {item.is_liked ? "❤️" : "🤍"} {item.like_count}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.commentAction}
              onPress={() =>
                setReplyTo({ id: item.id, username: item.user.username })
              }
            >
              <Text style={styles.commentActionText}>↩️ Trả lời</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Replies */}
      {item.replies?.map((reply: any) => (
        <View key={reply.id} style={styles.replyItem}>
          <UserAvatar
            uri={reply.user.avatar_url}
            username={reply.user.username}
            size={28}
            color={Colors.surfaceLight}
          />
          <View style={styles.commentBody}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentUsername}>@{reply.user.username}</Text>
              <Text style={styles.commentTime}>
                {getTimeAgo(reply.created_at)}
              </Text>
            </View>
            <Text style={styles.commentContent}>{reply.content}</Text>
            <TouchableOpacity
              style={styles.commentAction}
              onPress={() => handleLikeComment(reply.id)}
            >
              <Text style={styles.commentActionText}>
                {reply.is_liked ? "❤️" : "🤍"} {reply.like_count}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={comments || []}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="💬"
            title="Chưa có bình luận"
            message="Hãy là người đầu tiên bình luận!"
          />
        }
      />

      {/* Input Bar */}
      <View style={styles.inputBar}>
        {replyTo && (
          <View style={styles.replyBanner}>
            <Text style={styles.replyBannerText}>
              ↩️ Trả lời @{replyTo.username}
            </Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Text style={styles.replyBannerClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <MentionInput
            style={{ flex: 1 }}
            placeholder={
              replyTo
                ? `Trả lời @${replyTo.username}...`
                : "Viết bình luận (@để nhắc đến)..."
            }
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxHeight={100}
            availableUsers={availableMentionUsers}
            onMentionSelected={(user) => {
              console.log("[Comments] User mentioned:", user.username);
            }}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newComment.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!newComment.trim() || createCommentMutation.isPending}
          >
            <Text style={styles.sendIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.base, paddingBottom: 20 },
  commentItem: { marginBottom: Spacing.lg },
  commentMain: { flexDirection: "row" },
  commentBody: { flex: 1, marginLeft: Spacing.sm },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  commentUsername: {
    color: Colors.textPrimary,
    fontWeight: "700",
    fontSize: Fonts.sizes.sm,
  },
  commentTime: { color: Colors.textMuted, fontSize: Fonts.sizes.xs },
  commentContent: {
    color: Colors.textSecondary,
    fontSize: Fonts.sizes.md,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  commentAction: {},
  commentActionText: { color: Colors.textMuted, fontSize: Fonts.sizes.xs },
  replyItem: { flexDirection: "row", marginLeft: 44, marginTop: Spacing.md },
  inputBar: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.surfaceBorder,
    backgroundColor: Colors.backgroundLight,
    paddingBottom: 20,
  },
  replyBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceBorder,
  },
  replyBannerText: { color: Colors.primary, fontSize: Fonts.sizes.sm },
  replyBannerClose: { color: Colors.textMuted, fontSize: 16 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 18 },
});
