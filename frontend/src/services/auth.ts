export interface AuthUser {
  email: string;
  name: string;
  picture?: string;
  google_id?: string;
  saved_places?: string[];
}

const AUTH_STORAGE_KEY = 'bango_auth_user';

export const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveStoredUser = (user: AuthUser): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save user session:', err);
  }
};

export const clearStoredUser = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear user session:', err);
  }
};

export const authenticateWithGoogle = async (params: {
  credential?: string;
  access_token?: string;
}): Promise<AuthUser> => {
  const response = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to authenticate with Google');
  }

  const data = await response.json();
  const user: AuthUser = data.user;
  saveStoredUser(user);
  return user;
};

export const syncUserSavedPlaces = async (
  email: string,
  savedPlaceIds: string[]
): Promise<void> => {
  try {
    await fetch('/api/auth/sync-saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, saved_place_ids: savedPlaceIds }),
    });
  } catch (err) {
    console.warn('Failed to sync saved places with cloud:', err);
  }
};
