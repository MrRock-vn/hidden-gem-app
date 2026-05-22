import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { usersAPI } from '../../services/api';
import { appStorage } from '../../services/storage';
import { Colors, Spacing, BorderRadius, Fonts } from '../../constants/theme';

type ModalMode = 'email' | 'password' | null;

export default function SettingsScreen() {
  const { user, logout, setUser } = useAuthStore();
  const { isDark, colors, toggleDarkMode } = useThemeStore();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [infoModal, setInfoModal] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await usersAPI.getSettings();
      setPushEnabled(!!data.push_notifications);
      setPrivateAccount(!!data.is_private);
      setEmail(data.email || user?.email || '');
    } catch {
      setEmail(user?.email || '');
    }
  };

  const updateRemoteSettings = async (next: {
    push_notifications?: boolean;
    is_private?: boolean;
  }) => {
    try {
      setIsSaving(true);
      await usersAPI.updateSettings(next);
    } catch (error: any) {
      Alert.alert('Loi', error.response?.data?.message || 'Khong the cap nhat cai dat');
      await loadSettings();
    } finally {
      setIsSaving(false);
    }
  };

  const handlePushChange = (value: boolean) => {
    setPushEnabled(value);
    updateRemoteSettings({ push_notifications: value });
  };

  const handlePrivateChange = (value: boolean) => {
    setPrivateAccount(value);
    updateRemoteSettings({ is_private: value });
  };

  const handleDarkModeChange = async (value: boolean) => {
    await toggleDarkMode(value);
  };

  const closeModal = () => {
    setModalMode(null);
    setCurrentPassword('');
    setNewPassword('');
    setEmail(user?.email || email);
  };

  const saveEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Email khong hop le', 'Vui long nhap email dung dinh dang');
      return;
    }

    try {
      setIsSaving(true);
      const { data } = await usersAPI.updateEmail(email.trim().toLowerCase());
      setUser(data);
      setEmail(data.email);
      setModalMode(null);
      Alert.alert('Thanh cong', 'Email da duoc cap nhat');
    } catch (error: any) {
      Alert.alert('Loi', error.response?.data?.message || 'Khong the doi email');
    } finally {
      setIsSaving(false);
    }
  };

  const savePassword = async () => {
    if (!currentPassword || newPassword.length < 6) {
      Alert.alert('Mat khau khong hop le', 'Mat khau moi phai co it nhat 6 ky tu');
      return;
    }

    try {
      setIsSaving(true);
      await usersAPI.updatePassword({ currentPassword, newPassword });
      setModalMode(null);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Thanh cong', 'Mat khau da duoc cap nhat. Hay dang nhap lai.', [
        { text: 'OK', onPress: logout },
      ]);
    } catch (error: any) {
      Alert.alert('Loi', error.response?.data?.message || 'Khong the doi mat khau');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Xoa tai khoan',
      'Ban co chac chan muon xoa tai khoan? Hanh dong nay khong the hoan tac.',
      [
        { text: 'Huy', style: 'cancel' },
        {
          text: 'Xoa',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              await usersAPI.deleteMe();
              await logout();
            } catch (error: any) {
              Alert.alert(
                'Loi',
                error.response?.data?.message || 'Khong the xoa tai khoan',
              );
            } finally {
              setIsSaving(false);
            }
          },
        },
      ],
    );
  };

  const showComingSoon = (title: string) => {
    Alert.alert(title, 'Tinh nang nay se duoc bo sung sau.');
  };

  const showInfo = (type: 'about' | 'terms' | 'privacy') => {
    if (type === 'about') {
      setInfoModal({
        title: 'Giới thiệu về Hidden Gem',
        content: `✨ Hidden Gem là nền tảng mạng xã hội kết nối những tâm hồn đam mê khám phá các "viên ngọc ẩn" độc đáo tại Việt Nam.

📍 Tìm kiếm toạ độ lý tưởng:
Khám phá những quán cà phê specialty yên tĩnh, món ăn địa phương độc đáo, góc chụp ảnh đầy tính nghệ thuật hay khung cảnh thiên nhiên hùng vĩ ẩn mình quanh bạn.

👥 Kết nối cộng đồng:
Đăng tải và chia sẻ những địa điểm đặc sắc bạn tự mình khám phá. Theo dõi những người cùng gu để xây dựng bản đồ ẩm thực và check-in chất lượng nhất.

🌿 Trải nghiệm du lịch bền vững:
Mỗi địa điểm được chia sẻ là một phần thúc đẩy du lịch và dịch vụ bản địa phát triển lành mạnh, tôn trọng thiên nhiên và con người địa phương.`
      });
    } else if (type === 'terms') {
      setInfoModal({
        title: 'Điều khoản dịch vụ',
        content: `Chào mừng bạn đến với Hidden Gem. Khi sử dụng ứng dụng, bạn đồng ý tuân thủ các quy định sau:

1. Trách nhiệm tài khoản:
Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mọi hoạt động được thực hiện dưới tên đăng nhập của mình.

2. Tiêu chuẩn nội dung:
Mọi địa điểm, hình ảnh, bài review, bình luận bạn chia sẻ phải tuân thủ pháp luật và đạo đức cộng đồng. Tuyệt đối không đăng tải thông tin xuyên tạc, bôi nhọ, ngôn từ thù ghét, hoặc quảng cáo trái phép.

3. Quyền hạn của ứng dụng:
Hidden Gem có quyền duyệt bài, ẩn bài hoặc khoá tài khoản nếu phát hiện bất kỳ nội dung vi phạm tiêu chuẩn cộng đồng hoặc bị báo cáo spam giả mạo nhiều lần.

4. Cập nhật dịch vụ:
Chúng tôi có thể cập nhật, sửa đổi dịch vụ và các điều khoản này theo thời gian để tối ưu hóa trải nghiệm người dùng.`
      });
    } else if (type === 'privacy') {
      setInfoModal({
        title: 'Chính sách quyền riêng tư',
        content: `Hidden Gem cam kết bảo vệ tuyệt đối thông tin cá nhân và quyền riêng tư của bạn:

1. Thu thập thông tin:
Chúng tôi thu thập email, tên người dùng để quản lý tài khoản. Thông tin vị trí GPS chỉ được sử dụng khi bạn cấp quyền và mở app, giúp tính toán khoảng cách thực tế đến các địa điểm.

2. Không chia sẻ bên thứ ba:
Chúng tôi cam kết không chia sẻ dữ liệu vị trí, email hoặc bất kỳ thông tin cá nhân nào của bạn cho doanh nghiệp quảng cáo hay bên thứ ba nào vì mục đích thương mại.

3. Bảo mật mật mã tiên tiến:
Mật khẩu của bạn được mã hoá một chiều bằng thuật toán BCrypt trước khi lưu vào cơ sở dữ liệu. Ngay cả đội ngũ kỹ thuật cũng không thể đọc được mật khẩu của bạn.

4. Quyền tự chủ dữ liệu:
Bạn hoàn toàn có quyền chỉnh sửa hồ sơ hoặc yêu cầu xóa vĩnh viễn tài khoản và các dữ liệu liên quan bất kỳ lúc nào trực tiếp trong phần Cài đặt.`
      });
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, right }: any) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !right}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {right || (onPress ? <Text style={styles.settingArrow}>›</Text> : null)}
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Tai khoan</Text>
        <View style={styles.section}>
          <SettingItem icon="✏️" title="Chinh sua ho so" onPress={() => router.push('/settings/edit-profile')} />
          <SettingItem icon="🔑" title="Doi mat khau" onPress={() => setModalMode('password')} />
          <SettingItem icon="📧" title="Email" subtitle={email} onPress={() => setModalMode('email')} />
        </View>

        <Text style={styles.sectionTitle}>Thong bao</Text>
        <View style={styles.section}>
          <SettingItem
            icon="🔔"
            title="Push Notification"
            right={
              <Switch
                value={pushEnabled}
                onValueChange={handlePushChange}
                trackColor={{ true: Colors.primary }}
                disabled={isSaving}
              />
            }
          />
        </View>

        <Text style={styles.sectionTitle}>Quyen rieng tu</Text>
        <View style={styles.section}>
          <SettingItem
            icon="🔒"
            title="Tai khoan rieng tu"
            subtitle="Chi follower moi xem duoc bai dang"
            right={
              <Switch
                value={privateAccount}
                onValueChange={handlePrivateChange}
                trackColor={{ true: Colors.primary }}
                disabled={isSaving}
              />
            }
          />
          <SettingItem icon="🚫" title="Danh sach chan" onPress={() => router.push('/settings/blocked')} />
        </View>

        <Text style={styles.sectionTitle}>Giao dien</Text>
        <View style={styles.section}>
          <SettingItem
            icon="🌙"
            title="Dark Mode"
            subtitle={isDark ? 'Đang bật' : 'Đang tắt'}
            right={
              <Switch
                value={isDark}
                onValueChange={handleDarkModeChange}
                trackColor={{ true: Colors.primary }}
              />
            }
          />
        </View>

        <Text style={styles.sectionTitle}>Thong tin</Text>
        <View style={styles.section}>
          <SettingItem icon="ℹ️" title="Gioi thieu" onPress={() => showInfo('about')} />
          <SettingItem icon="📋" title="Dieu khoan dich vu" onPress={() => showInfo('terms')} />
          <SettingItem icon="🔐" title="Chinh sach quyen rieng tu" onPress={() => showInfo('privacy')} />
          <SettingItem icon="📦" title="Phien ban" subtitle="1.0.0" />
        </View>

        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout} disabled={isSaving}>
            <Text style={styles.logoutText}>Dang xuat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} disabled={isSaving}>
            <Text style={styles.deleteText}>Xoa tai khoan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={modalMode !== null} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {modalMode === 'email' ? 'Doi email' : 'Doi mat khau'}
            </Text>

            {modalMode === 'email' ? (
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="email@example.com"
                placeholderTextColor={Colors.textMuted}
              />
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholder="Mat khau hien tai"
                  placeholderTextColor={Colors.textMuted}
                />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Mat khau moi"
                  placeholderTextColor={Colors.textMuted}
                />
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal} disabled={isSaving}>
                <Text style={styles.cancelText}>Huy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={modalMode === 'email' ? saveEmail : savePassword}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.saveText}>Luu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={infoModal !== null} transparent animationType="slide" onRequestClose={() => setInfoModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { maxHeight: '80%' }]}>
            <Text style={styles.modalTitle}>{infoModal?.title}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: Spacing.md }}>
              <Text style={styles.infoContentText}>{infoModal?.content}</Text>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveButton} onPress={() => setInfoModal(null)}>
                <Text style={styles.saveText}>Dong</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.base },
  sectionTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  section: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 0.5,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceBorder,
  },
  settingIcon: { fontSize: 20, marginRight: Spacing.md },
  settingContent: { flex: 1 },
  settingTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, fontWeight: '500' },
  settingSubtitle: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: 2 },
  settingArrow: { color: Colors.textMuted, fontSize: 20 },
  dangerZone: { marginTop: Spacing['2xl'], marginBottom: 40, gap: Spacing.sm },
  logoutButton: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    alignItems: 'center',
  },
  logoutText: { color: Colors.warning, fontSize: Fonts.sizes.md, fontWeight: '600' },
  deleteButton: {
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  deleteText: { color: Colors.error, fontSize: Fonts.sizes.md, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modal: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: Fonts.sizes.xl,
    fontWeight: '800',
    marginBottom: Spacing.base,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    color: Colors.textPrimary,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  cancelText: { color: Colors.textSecondary, fontWeight: '700' },
  saveButton: {
    minWidth: 84,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  saveText: { color: Colors.white, fontWeight: '800' },
  infoContentText: {
    color: Colors.textSecondary,
    fontSize: Fonts.sizes.md,
    lineHeight: 22,
  },
});
