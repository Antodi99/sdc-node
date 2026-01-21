<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";
import { useAuth } from "./composables/useAuth";

const router = useRouter();
const { isAuthenticated, isAdmin, token, logout } = useAuth();

const notifications = ref([]);
let socket = null;

function notify(text) {
  const id = Date.now() + Math.random();
  notifications.value.push({ id, text });
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 5000);
}

function connectSocket() {
  if (socket || !isAuthenticated.value) return;

  socket = io(import.meta.env.VITE_API_WS, {
    transports: ["websocket"],
    auth: { token: token.value },
  });

  socket.on("article-updated", (msg) => {
    if (msg.type === "created") {
      notify(`Created: "${msg.title}"`);
    } else if (msg.type === "updated") {
      notify(`Updated: "${msg.title}"`);
    } else if (msg.type === "attachment-added") {
      notify(
        `Attachment added to "${msg.title}": ${msg.attachment.originalName}`
      );
    } else if (msg.type === "deleted") {
      notify(`Deleted article #${msg.id}`);
    }
  });
}

function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

function doLogout() {
  logout();
  disconnectSocket();
  router.push("/login");
}

onMounted(() => {
  if (isAuthenticated.value) connectSocket();
});

onBeforeUnmount(disconnectSocket);

watch(isAuthenticated, (loggedIn) => {
  if (loggedIn) connectSocket();
  else disconnectSocket();
});
</script>

<template>
  <header class="header">
    <div class="inner">
      <div class="brand"><span class="dot"></span>Articles</div>

      <nav class="nav">
        <router-link to="/">List</router-link>
        <router-link v-if="isAuthenticated" to="/create">Create</router-link>
        <router-link v-if="isAuthenticated" to="/workspaces"
          >Workspaces</router-link
        >
        <router-link v-if="isAuthenticated && isAdmin" to="/users"
          >Users</router-link
        >
      </nav>

      <div class="auth">
        <router-link
          v-if="!isAuthenticated"
          to="/login"
          class="button secondary"
        >
          Login
        </router-link>
        <button v-else class="button secondary" @click="doLogout">
          Logout
        </button>
      </div>
    </div>
  </header>

  <div class="notifs">
    <div v-for="n in notifications" :key="n.id" class="notif">{{ n.text }}</div>
  </div>

  <main class="container">
    <router-view />
  </main>
</template>

<style>
.header {
  border-bottom: 1px solid #222;
}

.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.brand {
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #5865f2;
  border-radius: 50%;
}

.nav {
  display: flex;
  gap: 12px;
}

.nav a {
  color: #c9d1d9;
  text-decoration: none;
}

.nav a.router-link-active {
  color: #58a6ff;
}

.auth {
  display: flex;
  gap: 10px;
}

.notifs {
  margin: 10px;
}

.notif {
  background: #5865f2;
  padding: 6px 10px;
  border-radius: 4px;
  margin-bottom: 6px;
}

.container {
  padding: 16px;
}
</style>
