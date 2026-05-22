import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useCreatePlace } from "../../hooks/usePlaces";
import { usePlaceDrafts } from "../../hooks/useDrafts";
import { LocationPicker } from "../../components/LocationPicker";
import { DraftsModal } from "../../components/DraftsModal";
import {
  Colors,
  Spacing,
  BorderRadius,
  Fonts,
  Categories,
} from "../../constants/theme";

export default function CreatePlaceScreen() {
  const params = useLocalSearchParams<{ draftId?: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [draftId, setDraftId] = useState(
    params?.draftId || `draft_${Date.now()}`,
  );
  const [isLoadingDraft, setIsLoadingDraft] = useState(!!params?.draftId);

  const createPlaceMutation = useCreatePlace();
  const { saveDraft, loadDraft } = usePlaceDrafts();

  // Load draft if provided
  useEffect(() => {
    if (params?.draftId) {
      loadDraft(params.draftId).then((draft) => {
        if (draft) {
          setTitle(draft.title);
          setDescription(draft.description);
          setCategory(draft.category);
          setAddress(draft.address);
          setLatitude(draft.latitude);
          setLongitude(draft.longitude);
          setTags(draft.tags);
          setImages(draft.imageUris);
          setDraftId(draft.id);
        }
        setIsLoadingDraft(false);
      });
    }
  }, [params?.draftId, loadDraft]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await saveDraft({
          id: draftId,
          title,
          description,
          category,
          address,
          latitude,
          longitude,
          tags,
          imageUris: images,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      } catch (error) {
        console.error("[CreatePlace] Auto-save failed:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [
    title,
    description,
    category,
    address,
    latitude,
    longitude,
    tags,
    images,
    draftId,
  ]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10 - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map((a) => a.uri)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !category || !description.trim()) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng điền tiêu đề, mô tả và chọn danh mục",
      );
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert("Thiếu vị trí", "Vui lòng chọn vị trí trên bản đồ");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("latitude", String(latitude));
      formData.append("longitude", String(longitude));
      if (address.trim()) formData.append("address", address.trim());
      if (tags.trim()) {
        const tagList = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        formData.append("tags", JSON.stringify(tagList));
      }

      // Add images
      images.forEach((uri, i) => {
        const filename = uri.split("/").pop() || `photo-${i}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const extension = match?.[1]?.toLowerCase();
        const type = extension ? `image/${extension === "jpg" ? "jpeg" : extension}` : "image/jpeg";
        formData.append("images", {
          uri,
          name: filename,
          type,
        } as any);
      });

      const response = await createPlaceMutation.mutateAsync(formData);
      const createdPlace = response?.data ?? response;
      Alert.alert("Thành công!", "Địa điểm đã được đăng", [
        {
          text: "OK",
          onPress: () =>
            createdPlace?.id
              ? router.replace(`/place/${createdPlace.id}`)
              : router.replace("/(tabs)"),
        },
      ]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể đăng địa điểm. Vui lòng kiểm tra kết nối và đăng nhập lại.";
      Alert.alert("Đăng thất bại", Array.isArray(message) ? message.join("\n") : message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header with Drafts Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📍 Đăng địa điểm mới</Text>
        <TouchableOpacity
          style={styles.draftsButton}
          onPress={() => setShowDraftsModal(true)}
        >
          <Text style={styles.draftsButtonText}>📝 Bản nháp</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Ảnh ({images.length}/10)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesRow}
          >
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={pickImages}
            >
              <Text style={styles.addImageIcon}>+</Text>
              <Text style={styles.addImageText}>Thêm ảnh</Text>
            </TouchableOpacity>
            {images.map((uri, i) => (
              <View key={`create-image-${i}`} style={styles.imagePreview}>
                <Image
                  source={{ uri }}
                  style={styles.imagePreviewImg}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => removeImage(i)}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Tiêu đề *</Text>
          <TextInput
            style={styles.input}
            placeholder="Tên địa điểm"
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />
          <Text style={styles.charCount}>{title.length}/200</Text>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Danh mục *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  category === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat.id && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.icon} {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Mô tả *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Chia sẻ về địa điểm này..."
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.label}>📍 Địa chỉ</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập địa chỉ hoặc chọn trên bản đồ"
            placeholderTextColor={Colors.textMuted}
            value={address}
            onChangeText={setAddress}
          />
          <TouchableOpacity
            style={styles.mapPicker}
            onPress={() => setShowLocationPicker(true)}
          >
            <Text style={styles.mapPickerText}>
              {latitude && longitude
                ? `✓ Vị trí: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                : "🗺️ Chọn vị trí trên bản đồ"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.label}>🏷️ Tags (phân cách bằng dấu phẩy)</Text>
          <TextInput
            style={styles.input}
            placeholder="vintage, chill, yên tĩnh"
            placeholderTextColor={Colors.textMuted}
            value={tags}
            onChangeText={setTags}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            createPlaceMutation.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createPlaceMutation.isPending}
        >
          {createPlaceMutation.isPending ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>📍 Đăng địa điểm</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Location Picker Modal */}
      <LocationPicker
        visible={showLocationPicker}
        onLocationSelected={(lat, lng, addr) => {
          setLatitude(lat);
          setLongitude(lng);
          if (addr) setAddress(addr);
          setShowLocationPicker(false);
        }}
        onCancel={() => setShowLocationPicker(false)}
        initialLat={latitude}
        initialLng={longitude}
      />

      {/* Drafts Modal */}
      <DraftsModal
        visible={showDraftsModal}
        onClose={() => setShowDraftsModal(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  draftsButton: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  draftsButtonText: {
    color: Colors.primary,
    fontSize: Fonts.sizes.sm,
    fontWeight: "600",
  },
  scrollContent: { padding: Spacing.base, paddingBottom: 40 },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Fonts.sizes.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    fontSize: Fonts.sizes.base,
    color: Colors.textPrimary,
  },
  textArea: { minHeight: 120 },
  charCount: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.xs,
    textAlign: "right",
    marginTop: 4,
  },
  imagesRow: { paddingVertical: Spacing.sm },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  addImageIcon: { fontSize: 28, color: Colors.textMuted },
  addImageText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    position: "relative",
    overflow: "hidden",
  },
  imagePreviewImg: {
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius.md,
  },
  removeImage: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.error,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: { color: Colors.white, fontSize: 12, fontWeight: "700" },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: Spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
  categoryChipTextActive: { color: Colors.white, fontWeight: "700" },
  mapPicker: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  mapPickerText: {
    color: Colors.primary,
    fontSize: Fonts.sizes.md,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    alignItems: "center",
    height: 52,
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: {
    color: Colors.white,
    fontSize: Fonts.sizes.lg,
    fontWeight: "700",
  },
});
