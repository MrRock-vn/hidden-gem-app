import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { useDrafts } from "../hooks/useDrafts";
import { Colors, Spacing, BorderRadius, Fonts } from "../constants/theme";
import type { PlaceDraft } from "../services/drafts";

interface DraftsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DraftsModal({ visible, onClose }: DraftsModalProps) {
  const { loadAllDrafts, removeDraft } = useDrafts();
  const [drafts, setDrafts] = useState<PlaceDraft[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadAllDrafts().then((loadedDrafts) => {
        setDrafts(loadedDrafts);
        setLoading(false);
      });
    }
  }, [visible]);

  const handleOpenDraft = (draft: PlaceDraft) => {
    onClose();
    router.push({
      pathname: "/place/create",
      params: { draftId: draft.id },
    });
  };

  const handleDeleteDraft = (draft: PlaceDraft) => {
    Alert.alert("Xóa bản nháp", `Bạn chắc chắn muốn xóa "${draft.title}"?`, [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await removeDraft(draft.id);
            setDrafts(drafts.filter((d) => d.id !== draft.id));
            Alert.alert("Thành công", "Bản nháp đã bị xóa");
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa bản nháp");
          }
        },
      },
    ]);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📝 Bản nháp ({drafts.length})</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Drafts List */}
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : drafts.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>Chưa có bản nháp nào</Text>
          </View>
        ) : (
          <ScrollView style={styles.draftsList}>
            {drafts.map((draft) => (
              <TouchableOpacity
                key={draft.id}
                style={styles.draftItem}
                onPress={() => handleOpenDraft(draft)}
              >
                <View style={styles.draftContent}>
                  <Text style={styles.draftTitle} numberOfLines={1}>
                    {draft.title || "(Không có tiêu đề)"}
                  </Text>
                  <Text style={styles.draftPreview} numberOfLines={2}>
                    {draft.description}
                  </Text>
                  <View style={styles.draftMeta}>
                    <Text style={styles.draftDate}>
                      {formatDate(draft.updatedAt)}
                    </Text>
                    {draft.imageUris.length > 0 && (
                      <Text style={styles.draftImages}>
                        📸 {draft.imageUris.length}
                      </Text>
                    )}
                    {draft.category && (
                      <Text style={styles.draftCategory}>{draft.category}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteDraft(draft)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Fonts.sizes.lg,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: Fonts.sizes.base,
    color: Colors.textMuted,
  },
  draftsList: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  draftItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  draftContent: {
    flex: 1,
  },
  draftTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  draftPreview: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  draftMeta: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  draftDate: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
  },
  draftImages: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
  },
  draftCategory: {
    fontSize: Fonts.sizes.xs,
    backgroundColor: Colors.primary,
    color: Colors.white,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  deleteButton: {
    paddingHorizontal: Spacing.md,
  },
  deleteButtonText: {
    fontSize: 20,
  },
});
