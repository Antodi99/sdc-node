import { ref, computed } from "vue";

const JWT_TOKEN_KEY = "token";

const token = ref(localStorage.getItem(JWT_TOKEN_KEY));

function decodeJwt(token) {
  const payload = token.split(".")[1];
  return JSON.parse(atob(payload));
}

function isTokenValid(rawToken) {
  if (!rawToken) return false;
  try {
    const { exp } = decodeJwt(rawToken);
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}

const isAuthenticated = computed(() => isTokenValid(token.value));

function setToken(newToken) {
  token.value = newToken;
  localStorage.setItem(JWT_TOKEN_KEY, newToken);
}

function logout() {
  token.value = null;
  localStorage.removeItem(JWT_TOKEN_KEY);
}

export function useAuth() {
  return {
    token,
    isAuthenticated,
    setToken,
    logout,
  };
}
