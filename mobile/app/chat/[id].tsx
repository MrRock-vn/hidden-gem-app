import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  useConversationMessages,
  useSendMessage,
  useConversations,
} from '../../hooks/useChat';
import { useAuthStore } from '../../stores/authStore';
import { socketService } from '../../services/socket';
import { chatAPI } from '../../services/api';
import { getMediaUrl } from '../../utils/media';
import { Colors, Spacing, BorderRadius, Fonts } from '../../constants/theme';

export default function ChatRoomScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { data: conversations } = useConversations();
  const conversation = conversations?.find((c) => c.id === conversationId);
  const partner = conversation?.otherParticipant;

  const { data: messagesData, isLoading } =
    useConversationMessages(conversationId);
  const sendMessageMutation = useSendMessage(conversationId);

  useEffect(() => {
    if (!conversationId) return;

    let mounted = true;

    const setupSocket = async () => {
      await socketService.connect();
      if (!mounted) return;
      socketService.joinConversation(conversationId);
    };

    setupSocket();

    const handleNewMessage = (message: any) => {
      // Optimistically insert message into cache if not present
      queryClient.setQueryData(['messages', conversationId], (old: any) => {
        if (!old) return old;
        const exists = old.data.some((m: any) => m.id === message.id);
        if (exists) return old;
        return {
          ...old,
          data: [...old.data, message],
        };
      });
      // Refresh list to update badge/last msg
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.leaveConversation(conversationId);
      socketService.offNewMessage();
    };
  }, [conversationId, queryClient]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessageMutation.mutate(inputText.trim());
    setInputText('');
  };

  const pickAndSendImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Cần quyền truy cập thư viện ảnh để gửi hình ảnh!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setIsUploading(true);
      const selectedImage = result.assets[0];

      // Prepare FormData
      const formData = new FormData();
      const filename = selectedImage.uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('file', {
        uri: selectedImage.uri,
        name: filename,
        type,
      } as any);

      // Upload image
      const response = await chatAPI.uploadImage(formData);
      const imageUrl = response.data.imageUrl;

      // Send chat message with imageUrl
      sendMessageMutation.mutate({ imageUrl });
    } catch (error) {
      console.error('[ChatRoom] Failed to pick/upload image:', error);
      alert('Tải ảnh lên thất bại. Vui lòng thử lại!');
    } finally {
      setIsUploading(false);
    }
  };

  // Backend trả về messages từ cũ -> mới (ASC)
  // Vì FlatList sử dụng inverted={true} (hiển thị phần tử chỉ mục 0 ở dưới cùng),
  // chúng ta cần đảo ngược mảng để tin nhắn mới nhất nằm ở index 0 (hiển thị dưới cùng gần ô nhập liệu).
  const displayMessages = messagesData?.data ? [...messagesData.data].reverse() : [];

  const renderMessageItem = ({ item }: { item: any }) => {
    const isMe = item.sender_id === currentUser?.id;
    const timeString = new Date(item.created_at).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const imageUrl = getMediaUrl(item.image_url);

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.myMessageRow : styles.theirMessageRow,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMe ? styles.myBubble : styles.theirBubble,
            imageUrl && styles.imageBubble,
          ]}
        >
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}
          {item.content && (
            <Text style={[isMe ? styles.myText : styles.theirText, imageUrl && styles.textWithImage]}>
              {item.content}
            </Text>
          )}
          <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
            {timeString}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: partner?.username || 'Trò chuyện',
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={displayMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          inverted
        />
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={pickAndSendImage}
            disabled={isUploading || sendMessageMutation.isPending}
            activeOpacity={0.7}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="images-outline" size={24} color={Colors.primary} />
            )}
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isUploading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isUploading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sendMessageMutation.isPending || isUploading}
            activeOpacity={0.7}
          >
            <Text style={styles.sendButtonText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  messagesList: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    width: '100%',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  imageBubble: {
    padding: Spacing.xs,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  messageImage: {
    width: 240,
    height: 180,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight,
  },
  textWithImage: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: BorderRadius.sm,
  },
  theirBubble: {
    backgroundColor: Colors.surfaceLight,
    borderBottomLeftRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  myText: {
    color: Colors.white,
    fontSize: Fonts.sizes.base,
  },
  theirText: {
    color: Colors.textPrimary,
    fontSize: Fonts.sizes.base,
  },
  timeText: {
    fontSize: Fonts.sizes.xs,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirTimeText: {
    color: Colors.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  attachButton: {
    padding: Spacing.sm,
    marginRight: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    fontSize: Fonts.sizes.base,
    color: Colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surfaceBorder,
  },
  sendButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: Fonts.sizes.base,
  },
});
