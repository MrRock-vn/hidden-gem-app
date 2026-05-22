/**
 * Mention utilities for comment/post content
 */

interface Mention {
  id: string;
  username: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Extract all @mentions from text
 * Returns array of mentions with their positions
 */
export function extractMentions(text: string): Mention[] {
  const mentions: Mention[] = [];
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      id: match[1], // username is used as temporary ID, should be resolved by backend
      username: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return mentions;
}

/**
 * Convert mentions in text to rich format for storage/display
 * Backend can parse this and create notification links
 */
export function formatMentionedText(text: string): string {
  // Return as-is; backend will parse @username patterns
  return text;
}

/**
 * Parse mention links from stored content
 * Converts @username references to clickable links
 */
export function parseMentionedText(
  text: string,
  onMentionPress?: (username: string) => void,
): { plainText: string; mentions: Mention[] } {
  const mentions = extractMentions(text);
  return {
    plainText: text,
    mentions,
  };
}

/**
 * Generate notification text for mentioned users
 */
export function getMentionNotificationText(
  username: string,
  context: "comment" | "post" = "comment",
): string {
  if (context === "comment") {
    return `@${username} đã nhắc đến bạn trong một bình luận`;
  }
  return `@${username} đã nhắc đến bạn trong một bài viết`;
}

/**
 * Extract unique mentioned usernames
 */
export function getUniqueMentionedUsernames(text: string): string[] {
  const mentions = extractMentions(text);
  return [...new Set(mentions.map((m) => m.username))];
}
