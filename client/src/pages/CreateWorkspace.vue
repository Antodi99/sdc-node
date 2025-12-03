<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "../plugins/axios";

const router = useRouter();

const name = ref("");
const label = ref("");
const error = ref("");
const loading = ref(false);

async function submit() {
  if (!name.value.trim() || !label.value.trim()) {
    error.value = "Name and label are required.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await axios.post("/workspaces", {
      name: name.value.trim(),
      label: label.value.trim(),
    });
    router.push("/workspaces");
  } catch (e) {
    error.value = e?.response?.data?.error?.message || e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="grid">
    <div class="card">
      <router-link class="button secondary" to="/workspaces">
        ← Back to list
      </router-link>
      <h2>Create Workspace</h2>

      <p v-if="error" class="error">{{ error }}</p>

      <label>Name (key, e.g. "general")</label>
      <input v-model="name" />

      <label>Label (display name)</label>
      <input v-model="label" />

      <button
        class="button"
        style="margin-top: 1rem"
        @click="submit"
        :disabled="loading"
      >
        {{ loading ? "Saving..." : "Create" }}
      </button>
    </div>
  </section>
</template>
