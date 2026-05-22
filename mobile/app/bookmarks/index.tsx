import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Modal, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useCollections, useCreateCollection, useDeleteCollection } from '../../hooks/useBookmarks';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import { Colors, Spacing, BorderRadius, Fonts } from '../../constants/theme';

export default function BookmarksScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const { data: collections, isLoading, refetch, isRefetching } = useCollections();
  const createMutation = useCreateCollection();
  const deleteMutation = useDeleteCollection();

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createMutation.mutateAsync({ name: newName.trim(), isPublic });
    } catch {}
    setNewName('');
    setIsPublic(false);
    setShowCreateModal(false);
  };

  if (isLoading) {
    return <LoadingScreen message="Đang tải bộ sưu tập..." />;
  }

  return (
    <View style={styles.container}>
      {/* Create Collection */}
      <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
        <Text style={styles.createIcon}>+</Text>
        <Text style={styles.createText}>Tạo bộ sưu tập mới</Text>
      </TouchableOpacity>

      <FlatList
        data={collections || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.collectionCard}>
            <View style={styles.previewGrid}>
              {(item.preview_icons || ['📍', '📍', '📍', '📍']).map((emoji: string, i: number) => (
                <View key={`${item.id}-preview-${i}`} style={styles.previewCell}>
                  <Text style={styles.previewEmoji}>{emoji}</Text>
                </View>
              ))}
            </View>
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionName}>{item.name}</Text>
              <View style={styles.collectionMeta}>
                <Text style={styles.collectionCount}>{item.place_count} địa điểm</Text>
                <Text style={styles.collectionPrivacy}>{item.is_public ? '🌐 Công khai' : '🔒 Riêng tư'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="🔖"
            title="Chưa có bộ sưu tập"
            message="Lưu lại những địa điểm yêu thích"
            actionLabel="Tạo bộ sưu tập"
            onAction={() => setShowCreateModal(true)}
          />
        }
      />

      {/* Create Collection Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo bộ sưu tập mới</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Tên bộ sưu tập"
              placeholderTextColor={Colors.textMuted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />

            <TouchableOpacity
              style={styles.publicToggle}
              onPress={() => setIsPublic(!isPublic)}
            >
              <Text style={styles.publicToggleText}>
                {isPublic ? '🌐 Công khai' : '🔒 Riêng tư'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, !newName.trim() && styles.modalConfirmDisabled]}
                onPress={handleCreate}
                disabled={!newName.trim() || createMutation.isPending}
              >
                <Text style={styles.modalConfirmText}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  createButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    margin: Spacing.base, padding: Spacing.base, borderRadius: BorderRadius.lg,
    borderWidth: 2, borderColor: Colors.surfaceBorder, borderStyle: 'dashed',
  },
  createIcon: { color: Colors.primary, fontSize: 24, marginRight: Spacing.sm },
  createText: { color: Colors.primary, fontSize: Fonts.sizes.md, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.base, paddingBottom: 40 },
  collectionCard: {
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md, overflow: 'hidden',
    borderWidth: 0.5, borderColor: Colors.surfaceBorder,
  },
  previewGrid: { flexDirection: 'row', height: 100 },
  previewCell: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.surfaceLight, borderRightWidth: 0.5, borderRightColor: Colors.surfaceBorder,
  },
  previewEmoji: { fontSize: 28 },
  collectionInfo: { padding: Spacing.base },
  collectionName: { color: Colors.textPrimary, fontSize: Fonts.sizes.base, fontWeight: '700' },
  collectionMeta: { flexDirection: 'row', gap: Spacing.md, marginTop: 4 },
  collectionCount: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm },
  collectionPrivacy: { color: Colors.textMuted, fontSize: Fonts.sizes.sm },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundLight, borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl, padding: Spacing.xl, paddingBottom: 40,
  },
  modalTitle: {
    fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.textPrimary,
    textAlign: 'center', marginBottom: Spacing.xl,
  },
  modalInput: {
    backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.surfaceBorder,
    borderRadius: BorderRadius.md, padding: Spacing.base,
    fontSize: Fonts.sizes.base, color: Colors.textPrimary, marginBottom: Spacing.base,
  },
  publicToggle: {
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md,
    padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  publicToggleText: { color: Colors.textSecondary, fontSize: Fonts.sizes.md },
  modalButtons: { flexDirection: 'row', gap: Spacing.md },
  modalCancel: {
    flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  modalCancelText: { color: Colors.textSecondary, fontWeight: '600', fontSize: Fonts.sizes.md },
  modalConfirm: {
    flex: 1, backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  modalConfirmDisabled: { opacity: 0.5 },
  modalConfirmText: { color: Colors.white, fontWeight: '700', fontSize: Fonts.sizes.md },
});
