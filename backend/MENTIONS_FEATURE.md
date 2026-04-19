# @Mention Feature for Comments

This document describes the @mention feature that allows users to tag other users in comments, with automatic push notifications sent to mentioned users.

## Overview

The mention system enables users to:

- Type `@username` in comment input to search and tag users
- Get autocomplete dropdown with available users in the conversation
- Send push notifications to mentioned users
- View mentions in notification center

## Frontend Implementation

### Components

#### `mobile/components/MentionInput.tsx`

A custom TextInput component with @mention autocomplete support.

**Features:**

- Detects `@` character and triggers mention dropdown
- Filters users based on search text after `@`
- Replaces mention with `@username` when selected
- Modal-based dropdown UI with smooth animations
- Full TypeScript support

**Usage:**

```typescript
<MentionInput
  value={newComment}
  onChangeText={setNewComment}
  placeholder="Write a comment (@to mention)"
  availableUsers={availableMentionUsers}
  onMentionSelected={(user) => console.log('Mentioned:', user.username)}
/>
```

**Props:**

- `value: string` - Current text input value
- `onChangeText: (text: string) => void` - Callback when text changes
- `placeholder?: string` - Placeholder text (default: "Type a message...")
- `multiline?: boolean` - Allow multiline input
- `onMentionSelected?: (user: User) => void` - Callback when user mentions another user
- `availableUsers: User[]` - List of users available for mention
- `maxHeight?: number` - Maximum height of input (default: 100)
- `style?: any` - Custom styles

### Services

#### `mobile/services/mentions.ts`

Utility functions for parsing and handling mentions in text.

**Key Functions:**

- `extractMentions(text: string): Mention[]` - Find all @mention patterns
- `getUniqueMentionedUsernames(text: string): string[]` - Get deduplicated usernames
- `getMentionNotificationText(username, context)` - Generate notification text
- `parseMentionedText(text)` - Parse mentions for display

**Example:**

```typescript
const text = 'Hey @john and @jane, check this out!';
const mentions = extractMentions(text);
// Returns: [{ username: "john", ... }, { username: "jane", ... }]

const usernames = getUniqueMentionedUsernames(text);
// Returns: ["john", "jane"]
```

### Integration in Comments Screen

In `mobile/app/place/comments/[id].tsx`:

```typescript
// Extract available users from comments
const availableMentionUsers = useMemo(() => {
  const users = new Map();
  comments?.forEach((comment) => {
    // Add comment author and all reply authors
    if (comment.user) users.set(comment.user.id, { ... });
    comment.replies?.forEach((reply) => {
      if (reply.user) users.set(reply.user.id, { ... });
    });
  });
  return Array.from(users.values());
}, [comments]);

// When sending comment, extract mentions
const handleSend = async () => {
  const mentionedUsernames = getUniqueMentionedUsernames(newComment);

  await createCommentMutation.mutateAsync({
    content: newComment,
    mentioned_usernames: mentionedUsernames, // Send to backend
  });
};
```

**What users see:**

- Comment input says: "Write a comment (@to mention)..."
- Type `@` to see dropdown of users in this place's comments
- Select a user to insert `@username`
- Submit comment normally

## Backend Implementation

### API Endpoint

#### `POST /places/:id/comments`

Enhanced to handle mentions.

**Request Body (updated):**

```typescript
{
  content: string;
  parent_id?: string;
  mentioned_usernames?: string[]; // NEW
}
```

**Example:**

```bash
POST /places/123/comments
{
  "content": "Hey @john, what do you think? @jane should see this too!",
  "mentioned_usernames": ["john", "jane"]
}
```

### DTO

#### `backend/src/social/dto/create-comment.dto.ts`

```typescript
export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsOptional()
  parent_id?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  mentioned_usernames?: string[];
}
```

### Service Logic

#### `backend/src/social/social.service.ts` - `createComment()`

Updated flow:

1. Validate place and parent comment exist
2. Create and save comment
3. Emit real-time event
4. **NEW**: Send notification to mentioned users

**Mention Notification Logic:**

```typescript
if (dto.mentioned_usernames && dto.mentioned_usernames.length > 0) {
  // Query users by username
  const mentionedUsers = await this.usersRepository.find({
    where: dto.mentioned_usernames.map((username) => ({ username })),
  });

  // Send push to each mentioned user
  for (const user of mentionedUsers) {
    if (
      user.id !== userId &&
      user.device_token &&
      user.push_notifications_enabled
    ) {
      await this.pushNotificationService.notifyMention(
        user.id,
        fullComment.user.username,
        dto.content,
        placeId,
        'comment',
      );
    }
  }
}
```

### Push Notification Service

#### `backend/src/notifications/push-notification.service.ts` - New Method

```typescript
async notifyMention(
  userId: string,
  mentionerUsername: string,
  mentionContext: string,
  contextId: string,
  mentionType: 'comment' | 'post' = 'comment',
): Promise<boolean>
```

**Notification Format:**

- iOS: `💬 @username mentioned you` with preview of text
- Android: Same with high priority
- Title: `💬 @mentionerUsername mentioned you`
- Body: `"context preview..." in a comment`
- Metadata:
  - `type: 'mention'`
  - `mentionType: 'comment'`
  - `contextId: placeId`
  - `mentionerUsername`

## Data Flow

```
User Types Comment:
├─ Text: "Hey @john, check this!"
├─ MentionInput detects @john
├─ Shows dropdown with available users
└─ User taps @john → inserts "@john"

User Sends Comment:
├─ Frontend extracts mentions: ["john"]
├─ Sends: { content: "...", mentioned_usernames: ["john"] }
├─ Backend creates comment
├─ Backend queries User where username = "john"
├─ Backend checks john.push_notifications_enabled
├─ Backend sends push: "💬 @sender mentioned you"
└─ John receives notification with mention data

John Taps Notification:
├─ App extracts contextId (placeId)
├─ Deep links to place comments screen
├─ Comment appears with @john mention highlighted
└─ User sees who mentioned them and context
```

## Display in Comments

Comments display @mentions as plain text (e.g., `@john`) but could be enhanced to:

- Highlight mentions in different color
- Make mentions tappable to view user profile
- Show notification badge on mentioned user's avatar

Example enhancement (future):

```typescript
const CommentContent = ({ content }: { content: string }) => {
  const parts = content.split(/(@\w+)/);

  return (
    <Text>
      {parts.map((part, i) =>
        part.startsWith('@') ? (
          <Text key={i} style={styles.mention}>{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
};
```

## Settings & Preferences

### User Model

Added to `User` entity:

- `push_notifications_enabled: boolean = true` - User can opt-out of push notifications including mentions

### Notification Opt-out

Users can disable mention notifications in settings:

```bash
PATCH /users/me/settings
{
  "push_notifications_enabled": false
}
```

## Error Handling

1. **User not found**: Silently skip if username doesn't exist (no error)
2. **No device token**: Silently skip if user hasn't registered device
3. **Firebase unavailable**: Graceful fallback (notification not sent but comment posted)
4. **Duplicate mentions**: Extract unique usernames to avoid duplicate notifications

## Performance Considerations

1. **Mention lookup**: O(n) where n = number of mentioned usernames
2. **Query optimization**: Use indexed username field for user lookup
3. **Batch sending**: Could use Firebase Multicast for multiple users
4. **Rate limiting**: Consider limiting mentions per comment (e.g., max 5)

## Future Enhancements

1. **Mention notifications feed**: Dedicated "Mentions" tab
2. **Mention-only view**: Filter comments by mentions to current user
3. **Mention analytics**: See who mentions you most
4. **Mention threads**: Auto-follow mention conversations
5. **Rich mention links**: Tap mention to view user profile
6. **Mention permissions**: Control who can mention you
7. **Mention threading**: Show mention context in notification
8. **Hashtag support**: Extend to #tags with place filtering

## Testing Checklist

- [ ] Type @ and see dropdown populate
- [ ] Filter dropdown when typing after @
- [ ] Select user and mention is inserted
- [ ] Multiple mentions in one comment
- [ ] Self-mention allowed (but no notification to self)
- [ ] Non-existent username handled gracefully
- [ ] Special characters in username handled
- [ ] Mentioned user receives push notification
- [ ] Notification has correct metadata for deep linking
- [ ] Comment posts successfully with mentions
- [ ] Mentions display correctly in comment thread
- [ ] User can disable mention notifications
- [ ] Notification appears on notification center
