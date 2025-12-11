<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "../plugins/axios";

const router = useRouter();

const workspaces = ref([]);
const loading = ref(false);
const error = ref("");

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await axios.get("/workspaces");
    workspaces.value = data;
  } catch (e) {
    error.value = e?.response?.data?.error?.message || e.message;
  } finally {
    loading.value = false;
  }
}

async function remove(ws) {
  if (
    !confirm(
      `Delete workspace "${ws.label}"? All listings in this workspace also will be deleted.`
    )
  )
    return;

  try {
    await axios.delete(`/workspaces/${ws.id}`);
    await load();
  } catch (e) {
    alert(e?.response?.data?.error?.message || e.message);
  }
}

function goCreate() {
  router.push("/workspaces/create");
}

function goEdit(ws) {
  router.push(`/workspaces/${ws.id}/edit`);
}

onMounted(load);
</script>

<template>
  <section class="grid">
    <div class="card">
      <router-link class="button secondary" to="/">← Back</router-link>
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
        "
      >
        <h2 style="margin: 0">Workspaces</h2>
        <button class="button" type="button" @click="goCreate">+ New</button>
      </div>

      <p v-if="loading" class="meta">Loading…</p>
      <p v-if="error" class="error">{{ error }}</p>

      <table v-if="!loading && workspaces.length" class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name (key)</th>
            <th>Label</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ws in workspaces" :key="ws.id">
            <td>#{{ ws.id }}</td>
            <td>{{ ws.name }}</td>
            <td>{{ ws.label }}</td>
            <td>
              <button
                class="button secondary"
                type="button"
                @click="goEdit(ws)"
              >
                Edit
              </button>
              <button
                class="button danger"
                type="button"
                style="margin-left: 0.5rem"
                @click="remove(ws)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="!loading && !workspaces.length" class="meta">
        No workspaces yet. Create one to start organizing articles.
      </p>
    </div>
  </section>
</template>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th,
td {
  border-bottom: 1px solid #222;
  padding: 6px 8px;
  text-align: left;
}
</style>
