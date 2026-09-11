import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface StoredUserInfo {
  id?: number;
  email?: string;
  name?: string;
  fullName?: string;
  full_name?: string;
  role?: string | number;
  roleId?: number;
  role_id?: number;
  branchId?: number | null;
  branch_id?: number | null;
  status?: string;
  profile_picture?: string;
  needs_password_change?: boolean;
  needs_profile_completion?: boolean;
  avatarInitials?: string;
  displayName?: string;
}

// Token refresh state
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Subscribe to token refresh
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Call all subscribers after token refresh
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

// Secure storage helper functions
export const secureSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
  }
};

export const secureGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return null;
  }
};

export const secureRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

const normalizeUserInfo = (user: any): StoredUserInfo | null => {
  if (!user || typeof user !== 'object') return null;

  const fullName =
    user.fullName ||
    user.full_name ||
    [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.name ||
    '';

  const roleId = user.roleId ?? user.role_id ?? (typeof user.role === 'number' ? user.role : undefined);
  const branchId = user.branchId ?? user.branch_id ?? null;
  const displayName = fullName || user.name || user.email || 'User';

  return {
    ...user,
    id: user.id ? Number(user.id) : undefined,
    email: user.email,
    name: displayName,
    fullName: displayName,
    full_name: displayName,
    role: user.role,
    roleId: roleId !== undefined ? Number(roleId) : undefined,
    role_id: roleId !== undefined ? Number(roleId) : undefined,
    branchId: branchId !== null && branchId !== undefined ? Number(branchId) : null,
    branch_id: branchId !== null && branchId !== undefined ? Number(branchId) : null,
    status: user.status,
    profile_picture: user.profile_picture,
    needs_password_change: user.needs_password_change,
    needs_profile_completion: user.needs_profile_completion,
    avatarInitials: displayName
      .split(' ')
      .filter(Boolean)
      .map((part: string) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
    displayName
  };
};

// Login function that communicates with the backend API
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/auth/login`, credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { success, message, data } = response.data;

    if (success && data?.tokens?.accessToken) {
      // Store the access token in localStorage
      secureSetItem('authToken', data.tokens.accessToken);

      // Store user info if available
      if (data.user) {
        const normalizedUser = normalizeUserInfo(data.user);
        if (normalizedUser) {
          secureSetItem('userInfo', JSON.stringify(normalizedUser));
        }
      }

      // Store permissions if available
      if (data.permissions) {
        secureSetItem('userPermissions', JSON.stringify(data.permissions));
      }

      // Set login status
      secureSetItem('isLoggedIn', 'true');
      
      // Debug: log what was stored
      console.log('Login successful, stored in localStorage:', {
        authToken: data.tokens.accessToken ? 'present' : 'missing',
        userInfo: data.user ? 'present' : 'missing',
        permissions: data.permissions ? 'present' : 'missing',
        isLoggedIn: 'true'
      });
    }

    return {
      success,
      message,
      token: data?.tokens?.accessToken,
      user: data?.user ? {
        id: data.user.id.toString(),
        email: data.user.email,
        name: data.user.fullName,
        role: data.user.roleId?.toString() || ''
      } : undefined
    };
  } catch (error: any) {
    console.error('Login error:', error);

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data.message || 'Login failed. Please check your credentials.',
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    } else {
      // Something else happened
      return {
        success: false,
        message: error.message || 'An unexpected error occurred during login.',
      };
    }
  }
};

// Logout function to clear user session
export const logout = (): void => {
  secureRemoveItem('authToken');
  secureRemoveItem('userInfo');
  secureRemoveItem('isLoggedIn');
  secureRemoveItem('refreshToken'); // Also remove refresh token if it exists
  secureRemoveItem('userPermissions'); // Previously left behind, so a next
  // login on the same browser without a fresh `permissions` payload could
  // inherit the outgoing admin's permission set.

  // adminDataStore (IndexedDB) is currently unwired/unused, but clear it
  // defensively so it can never leak a previous admin's cached staff/
  // department/branch/attendance data if it's adopted later without this
  // being revisited. Fire-and-forget: logout already triggers a full page
  // reload immediately after this call.
  import('./offline/adminDataStore')
    .then(({ adminDataStore }) => adminDataStore.clear())
    .catch((error) => console.error('Failed to clear admin data store on logout:', error));
};

// Function to check if user is logged in
export const isAuthenticated = (): boolean => {
  const isLoggedIn = secureGetItem('isLoggedIn');
  const token = secureGetItem('authToken');

  return isLoggedIn === 'true' && !!token;
};

// Function to get stored user info
export const getUserInfo = () => {
  const userInfoStr = secureGetItem('userInfo');
  if (userInfoStr) {
    try {
      return normalizeUserInfo(JSON.parse(userInfoStr));
    } catch (error) {
      console.error('Error parsing user info:', error);
      return null;
    }
  }
  return null;
};

// Function to get auth token
export const getAuthToken = (): string | null => {
  return secureGetItem('authToken');
};

// Function to refresh token (if needed)
export const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshTokenStored = secureGetItem('refreshToken');
    if (!refreshTokenStored) {
      return null;
    }

    const response = await axios.post(`${API_ENDPOINT}/auth/refresh`, {
      refreshToken: refreshTokenStored,
    });

    const { token } = response.data;
    if (token) {
      secureSetItem('authToken', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    logout(); // If refresh fails, log out the user
    return null;
  }
};

// Function to check if token is expired (helper function)
export const isTokenExpired = (token: string): boolean => {
  try {
    // Decode JWT token to check expiration
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decodedToken = JSON.parse(jsonPayload);
    const currentTime = Math.floor(Date.now() / 1000);

    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't decode the token, assume it's expired
  }
};

// Callback for authentication failure (401/403)
let onAuthFailed: (() => void) | null = null;

// Set the auth failed callback
export const setAuthFailedCallback = (callback: () => void) => {
  onAuthFailed = callback;
};

// Function to add authorization header to axios requests
export const setupAxiosInterceptors = (): void => {
  // Request interceptor to add auth token
  axios.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token expiration and refresh
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401/403 and we haven't tried to refresh yet
      if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axios(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshToken();
          if (newToken) {
            isRefreshing = false;
            onTokenRefreshed(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          isRefreshing = false;
          // Refresh failed, log out user
          if (onAuthFailed) {
            onAuthFailed();
          }
          return Promise.reject(refreshError);
        }

        isRefreshing = false;
      }

      // If still 401/403 after refresh attempt or no refresh token
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (onAuthFailed) {
          onAuthFailed();
        }
      }

      return Promise.reject(error);
    }
  );
};
