// Type declarations for optional OAuth modules
// These packages may not be installed in all environments

declare module "expo-auth-session/providers/google" {
  export function useIdTokenAuthRequest(config: {
    clientId: string;
  }): any;
  export function useAuthRequest(config: any): any;
}

declare module "expo-apple-authentication" {
  export const isAvailable: boolean;
  export function signInAsync(options: {
    requestedScopes: number[];
  }): Promise<{
    identityToken: string | null;
    user: string;
    email: string | null;
    fullName: { givenName: string | null; familyName: string | null } | null;
  }>;
  export enum AppleAuthenticationScope {
    FULL_NAME = 0,
    EMAIL = 1,
  }
}
