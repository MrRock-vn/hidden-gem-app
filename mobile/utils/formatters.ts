/**
 * Utility functions for formatting data in the mobile app
 */

/**
 * Format large numbers to abbreviated form
 * @param count - Number to format
 * @returns Formatted string (e.g., "1.2k", "5.3M")
 */
export const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "k";
  }
  return count.toString();
};

/**
 * Format timestamp to relative time string
 * @param dateStr - ISO date string
 * @returns Relative time (e.g., "5p trước", "2h trước")
 */
export const getTimeAgo = (dateStr: string): string => {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}p trước`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d trước`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w trước`;

  return new Date(dateStr).toLocaleDateString("vi-VN");
};

/**
 * Format distance in kilometers
 * @param distanceKm - Distance in kilometers
 * @returns Formatted distance string
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param length - Maximum length
 * @returns Truncated text with ellipsis
 */
export const truncateText = (text: string, length: number = 100): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

/**
 * Format phone number for Vietnamese format
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export const formatPhoneVN = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

/**
 * Format currency to VND
 * @param amount - Amount in VND
 * @returns Formatted currency string
 */
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
