import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import { getMediaUrl } from '../utils/media';

interface UserAvatarProps {
  uri?: string | null;
  username: string;
  size?: number;
  color?: string;
}

export default function UserAvatar({ uri, username, size = 40, color = Colors.primary }: UserAvatarProps) {
  const borderRadius = size / 2;
  const fontSize = size * 0.4;
  const imageUrl = getMediaUrl(uri);

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: size, height: size, borderRadius }]}
      />
    );
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius, backgroundColor: color }]}>
      <Text style={[styles.fallbackText, { fontSize }]}>
        {username.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: Colors.surfaceLight,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: Colors.white,
    fontWeight: '800',
  },
});
