import { API_URL } from "../constants/theme";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function getMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^(https?:|file:|data:)/.test(url)) return url;
  if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
  return `${API_ORIGIN}/${url}`;
}
