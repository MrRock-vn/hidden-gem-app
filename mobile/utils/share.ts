import { Share } from 'react-native';

export async function sharePlace(place: {
  id: string;
  title: string;
  description?: string;
  address?: string;
}) {
  try {
    const deepLink = `hiddenGem://place/${place.id}`;
    const message = `🗺️ ${place.title}\n\n${place.description || ''}\n\n📍 ${place.address || 'Xem chi tiết'}\n\n${deepLink}`;

    await Share.share({
      message,
      title: place.title,
      url: deepLink, // iOS only
    });
  } catch (error) {
    console.error('Share error:', error);
  }
}
