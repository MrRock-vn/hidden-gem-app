# OAuth2 Setup Guide - Google & Apple Sign-In

## Overview

Hidden Gem supports OAuth2 authentication via Google and Apple for frictionless user registration and login.

**Benefits:**

- Single-tap sign-in for existing Google/Apple users
- Reduced friction in user onboarding
- Automatic profile image from provider account
- Account linking - users can link OAuth to existing email accounts

## Google OAuth Setup

### Backend Configuration

#### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Hidden Gem"
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Type: **OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
5. Copy **Client ID** for backend configuration

#### 2. Update Backend `.env`

```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

#### 3. Backend Implementation Status

✅ **DONE:**

- `POST /auth/google` endpoint with token verification
- Creates new user or links to existing email
- Automatic avatar from Google profile picture
- Full integration in AuthService

**How it works:**

```typescript
POST /auth/google
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6I..."
}

Response:
{
  "user": { id, username, email, avatar_url, ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6I...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6I..."
}
```

---

## Apple OAuth Setup

### Backend Configuration

#### 1. Apple Developer Account

1. Go to [Apple Developer Account](https://developer.apple.com)
2. Create App ID with "Sign in with Apple" capability
3. Create Service ID for web/native integration
4. Generate private key (p8 file) - keep secure!
5. Get **Team ID**, **Service ID**, and **Key ID**

#### 2. Update Backend `.env`

```env
APPLE_CLIENT_ID=YOUR_SERVICE_ID_HERE
```

#### 3. Backend Implementation Status

✅ **DONE:**

- `POST /auth/apple` endpoint with token verification
- Creates new user or links to existing email
- Full integration in AuthService

**How it works:**

```typescript
POST /auth/apple
{
  "token": "eyJhbGciOiJFUzI1NiIsImtpZCI6IjEyMyJ9..."
}

Response:
{
  "user": { id, username, email, ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6I...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6I..."
}
```

---

## Mobile Configuration

### Google Sign-In (Android & iOS)

#### 1. Install Dependencies

```bash
cd mobile
npx expo install expo-auth-session expo-web-browser
```

#### 2. Configure Expo App

Update `mobile/app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-auth-session",
        {
          "googleClientId": "YOUR_GOOGLE_CLIENT_ID_ANDROID.apps.googleusercontent.com",
          "googleClientIdIOS": "YOUR_GOOGLE_CLIENT_ID_IOS.apps.googleusercontent.com"
        }
      ]
    ]
  }
}
```

#### 3. Get Google Client IDs

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials for:
   - **Android**:
     - Package name: `com.hidden.gem` (from app.json)
     - SHA-1 fingerprint: Get from `expo credentials:manager`
   - **iOS**:
     - Bundle ID: `com.hidden.gem`
3. Copy both Client IDs

#### 4. Set Expo Environment Variable

```bash
# In .env.local or terminal
export EXPO_PUBLIC_GOOGLE_CLIENT_ID_EXPO=YOUR_EXPO_CLIENT_ID
```

Or in `app.json`:

```json
{
  "expo": {
    "extra": {
      "googleClientIdExpo": "YOUR_EXPO_CLIENT_ID"
    }
  }
}
```

### Apple Sign-In (iOS Only)

#### 1. Install Dependencies

```bash
npx expo install expo-apple-authentication
```

#### 2. Configure Signing

Apple Sign-In requires a real device or simulator with iOS 13+.

In `app.json`:

```json
{
  "expo": {
    "plugins": ["expo-apple-authentication"],
    "ios": {
      "bundleIdentifier": "com.hidden.gem"
    }
  }
}
```

---

## Mobile Implementation

### `mobile/services/oauth.ts` - Created

✅ **Status: Complete**

Provides functions:

- `signInWithGoogle()` - Get Google ID token
- `signInWithApple()` - Get Apple identity token (iOS only)
- `loginWithOAuth(provider)` - Complete OAuth flow with backend verification
- `isAppleSignInAvailable()` - Check if device supports Apple Sign-In

### Mobile Usage Example

```typescript
import { loginWithOAuth, isAppleSignInAvailable } from '../services/oauth';
import { useAuthStore } from '../stores/authStore';

export function LoginScreen() {
  const { setUser } = useAuthStore();

  async function handleGoogleSignIn() {
    try {
      const result = await loginWithOAuth('google');
      setUser(result.user);
      // Navigate to home
    } catch (error) {
      console.error('Google login failed:', error);
    }
  }

  async function handleAppleSignIn() {
    try {
      const result = await loginWithOAuth('apple');
      setUser(result.user);
      // Navigate to home
    } catch (error) {
      console.error('Apple login failed:', error);
    }
  }

  return (
    <Button title="Sign in with Google" onPress={handleGoogleSignIn} />
    {isAppleSignInAvailable() && (
      <Button title="Sign in with Apple" onPress={handleAppleSignIn} />
    )}
  );
}
```

---

## API Endpoints

### Google Authentication

**Endpoint:** `POST /auth/google`

**Request:**

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6I..."
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@gmail.com",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "is_private": false,
    "created_at": "2025-04-18T10:30:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Apple Authentication

**Endpoint:** `POST /auth/apple`

**Request:**

```json
{
  "token": "eyJhbGciOiJFUzI1NiIsImtpZCI6IjEyMyJ9..."
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "username": "apple_user_1234",
    "email": "hidden@privaterelay.appleid.com",
    "avatar_url": null,
    "is_private": false,
    "created_at": "2025-04-18T10:30:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Testing OAuth

### Local Testing

#### 1. Get Test Credentials

```bash
# Start dev server
cd backend
npm run start:dev

# In another terminal, test endpoint
curl -X POST http://localhost:3000/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TEST_TOKEN"}'
```

#### 2. Test on Device

```bash
# Start Expo dev server
cd mobile
npx expo start --tunnel

# Scan QR code with Expo Go
# Click "Sign in with Google" button
```

#### 3. Monitor Logs

```bash
# Backend logs
npm run start:dev | grep -i "auth\|oauth"

# Mobile logs
# Check Expo console in web browser
```

---

## Account Linking

When user logs in with OAuth to email that already exists:

1. Backend finds existing user by email
2. Links OAuth account (sets `google_id` or `apple_id`)
3. User can now use both password login and OAuth
4. Subsequent OAuth logins to same email → links automatically

**Example Flow:**

```
1. User registers: email=john@gmail.com, password=***
2. Later, user tries: Sign in with Google (same Gmail account)
3. Backend: Finds user by email, links google_id
4. User can now use both email/password AND Google Sign-In
```

---

## Troubleshooting

### "Invalid token" Error

**Problem:** Backend rejects token

**Solutions:**

1. Verify Google Client ID matches in `.env`
2. Check token expiration (usually 1 hour)
3. Ensure token is ID token, not access token
4. Verify `GOOGLE_CLIENT_ID` in backend matches frontend

### "Google Sign-In not available"

**Problem:** Button doesn't show or crashes

**Solutions:**

1. Check `EXPO_PUBLIC_GOOGLE_CLIENT_ID_EXPO` is set
2. Verify Android/iOS credentials configured
3. Restart Expo server: `npm run start:dev -- --clear`
4. Check app.json has correct bundle ID

### "Apple Sign-In only available on iOS"

**Expected:** Android doesn't support Apple Sign-In

**Solution:** Check `isAppleSignInAvailable()` before showing button

### User created but missing email/name

**Problem:** OAuth provider didn't return email/name

**Solution:**

- Google: Usually provides both
- Apple: May use private email relay
- Fallback: Generate username as `{provider}_user_{timestamp}`

---

## Production Considerations

### 1. Separate OAuth Projects

Create separate OAuth apps for:

- **Development**: `hidden-gem-dev`
- **Production**: `hidden-gem-prod`

**Example:** `.env.production`

```env
GOOGLE_CLIENT_ID=prod-google-client-id
APPLE_CLIENT_ID=prod-apple-client-id
```

### 2. Secure Token Handling

**Never:**

- ❌ Store tokens in localStorage
- ❌ Log tokens
- ❌ Send over HTTP

**Do:**

- ✅ Use expo-secure-store for tokens
- ✅ Use HTTPS only
- ✅ Set token expiration (15 min access, 7 day refresh)

### 3. Email Verification

For production, consider:

- Requiring email verification before certain actions
- Sending verification email on first login
- Allowing users to update email after signup

### 4. Monitoring

Track OAuth adoption:

```sql
SELECT COUNT(*) as google_users FROM users WHERE google_id IS NOT NULL;
SELECT COUNT(*) as apple_users FROM users WHERE apple_id IS NOT NULL;
SELECT COUNT(*) as password_users FROM users WHERE password IS NOT NULL;
```

---

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign in with Apple](https://developer.apple.com/sign-in-with-apple/)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [google-auth-library-nodejs](https://github.com/googleapis/google-auth-library-nodejs)

---

## Implementation Checklist

- [x] Backend: Google OAuth endpoint (`POST /auth/google`)
- [x] Backend: Apple OAuth endpoint (`POST /auth/apple`)
- [x] Backend: Token verification with google-auth-library
- [x] Backend: Account linking logic
- [x] Mobile: Google Sign-In setup
- [x] Mobile: Apple Sign-In setup
- [x] Mobile: OAuth service (`mobile/services/oauth.ts`)
- [x] Mobile: Login screen integration
- [ ] Mobile: Test on real devices
- [ ] Backend: Production deployment
- [ ] Documentation: Update to production setup
