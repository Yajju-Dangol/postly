// PKCE Utilities for Buffer OAuth

export function generateCodeVerifier() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export const BUFFER_CONFIG = {
  clientId: '65e72390f77987019e000000', // Placeholder - User should update this in .env
  redirectUri: window.location.origin + '/callback',
  scopes: 'posts:write posts:read ideas:read ideas:write account:read account:write offline_access',
};

export const saveTokens = (tokens) => {
  localStorage.setItem('buffer_tokens', JSON.stringify({
    ...tokens,
    expiry: Date.now() + (tokens.expires_in * 1000)
  }));
};

export const getTokens = () => {
  const tokens = localStorage.getItem('buffer_tokens');
  if (!tokens) return null;
  return JSON.parse(tokens);
};

export const clearTokens = () => {
  localStorage.removeItem('buffer_tokens');
};
