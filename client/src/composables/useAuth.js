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

const payload = computed(() => decodeJwt(token.value));

const user = computed(() => {
  const p = payload.value;
  if (!p) return null;
  return { id: p.sub, email: p.email, role: p.role };
});

const isAuthenticated = computed(() => isTokenValid(token.value));
const isAdmin = computed(() => user.value?.role === "admin");

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
    user,
    isAuthenticated,
    isAdmin,
    setToken,
    logout,
  };
}
