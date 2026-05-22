/**
 * Validation utilities for form inputs and data validation
 */

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns true if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username (3-50 alphanumeric + underscore)
 * @param username - Username to validate
 * @returns Error message or empty string if valid
 */
export const validateUsername = (username: string): string => {
  if (!username) return "Tên người dùng không được để trống";
  if (username.length < 3) return "Tên người dùng phải ít nhất 3 ký tự";
  if (username.length > 50)
    return "Tên người dùng không được vượt quá 50 ký tự";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "Tên người dùng chỉ chứa chữ, số và dấu gạch dưới";
  }
  return "";
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Error message or empty string if valid
 */
export const validatePassword = (password: string): string => {
  if (!password) return "Mật khẩu không được để trống";
  if (password.length < 6) return "Mật khẩu phải ít nhất 6 ký tự";
  if (password.length > 128) return "Mật khẩu không được vượt quá 128 ký tự";
  return "";
};

/**
 * Validate password strength with requirements
 * @param password - Password to validate
 * @returns Object with strength level and recommendations
 */
export const checkPasswordStrength = (
  password: string,
): {
  strength: "weak" | "medium" | "strong";
  score: number;
  recommendations: string[];
} => {
  let score = 0;
  const recommendations: string[] = [];

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*]/.test(password)) score += 1;

  if (score < 2) {
    recommendations.push("Sử dụng ít nhất 8 ký tự");
    recommendations.push("Kết hợp chữ hoa, chữ thường, số");
  }
  if (!/\d/.test(password)) recommendations.push("Thêm số");
  if (!/[A-Z]/.test(password)) recommendations.push("Thêm chữ hoa");

  let strength: "weak" | "medium" | "strong" = "weak";
  if (score >= 3) strength = "medium";
  if (score >= 4) strength = "strong";

  return { strength, score, recommendations };
};

/**
 * Validate place title
 * @param title - Title to validate
 * @returns Error message or empty string if valid
 */
export const validatePlaceTitle = (title: string): string => {
  if (!title) return "Tiêu đề không được để trống";
  if (title.length < 3) return "Tiêu đề phải ít nhất 3 ký tự";
  if (title.length > 200) return "Tiêu đề không được vượt quá 200 ký tự";
  return "";
};

/**
 * Validate place description
 * @param description - Description to validate
 * @returns Error message or empty string if valid
 */
export const validatePlaceDescription = (description: string): string => {
  if (!description) return "Mô tả không được để trống";
  if (description.length < 10) return "Mô tả phải ít nhất 10 ký tự";
  if (description.length > 2000) return "Mô tả không được vượt quá 2000 ký tự";
  return "";
};

/**
 * Validate latitude and longitude
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Error message or empty string if valid
 */
export const validateCoordinates = (lat: number, lng: number): string => {
  if (lat < -90 || lat > 90) return "Vĩ độ không hợp lệ (-90 đến 90)";
  if (lng < -180 || lng > 180) return "Kinh độ không hợp lệ (-180 đến 180)";
  return "";
};

/**
 * Validate URL format
 * @param url - URL string to validate
 * @returns true if valid URL
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate phone number (Vietnamese)
 * @param phone - Phone number to validate
 * @returns Error message or empty string if valid
 */
export const validatePhoneVN = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10 && cleaned.startsWith("0")) return "";
  if (cleaned.length === 11 && cleaned.startsWith("84")) return "";
  if (cleaned.length === 10 && !cleaned.startsWith("0")) return "";
  return "Số điện thoại không hợp lệ";
};
