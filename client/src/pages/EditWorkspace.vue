<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "../plugins/axios";

const route = useRoute();
const router = useRouter();

const name = ref("");
const label = ref("");
const error = ref("");
const loading = ref(false);
const initialLoaded = ref(false);

async function load() {
  loading.value = true;
  error.value = "";

  try {
    const { data } = await axios.get(`/workspaces/${route.params.id}`);
    name.value = data.name;
    label.value = data.label;
    initialLoaded.value = true;
  } catch (e) {
    error.value = e?.response?.data?.error?.message || e.message;
  } finally {
    loading.value = false;
  }
}

async function submit() {
  if (!name.value.trim() || !label.value.trim()) {
    error.value = "Name and label are required.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await axios.put(`/workspaces/${route.params.id}`, {
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

onMounted(load);
</script>

<template>
  <section class="grid">
    <div class="card">
      <router-link class="button secondary" to="/workspaces">
        ← Back to list
      </router-link>
      <h2>Edit Workspace</h2>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="loading && !initialLoaded" class="meta">Loading…</p>

      <div v-if="!loading && initialLoaded">
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
          {{ loading ? "Saving..." : "Save changes" }}
        </button>
      </div>
    </div>
  </section>
</template>
