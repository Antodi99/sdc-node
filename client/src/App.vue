<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { io } from "socket.io-client";

const notifications = ref([]);
let socket = null;

function notify(text) {
  const id = Date.now() + Math.random();
  notifications.value.push({ id, text });
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 5000);
}

onMounted(() => {
  socket = io(import.meta.env.VITE_API_WS, {
    transports: ["websocket"],
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
    }
  });
});

onBeforeUnmount(() => {
  if (socket) socket.disconnect();
});
</script>

<template>
  <header class="header">
    <div class="inner">
      <div class="brand"><span class="dot"></span>Articles</div>
      <nav class="nav">
        <router-link to="/">List</router-link>
        <router-link to="/create">Create</router-link>
      </nav>
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
.notifs {
  margin: 10px;
}
.notif {
  background: #5865f2;
  padding: 6px 10px;
  border-radius: 4px;
  margin-bottom: 6px;
}
</style>
