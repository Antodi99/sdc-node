<script setup>
import { ref, onMounted } from "vue";
import api from "../plugins/axios";
import { useAuth } from "../composables/useAuth";

const { user } = useAuth();

const users = ref([]);
const error = ref("");
const loading = ref(false);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/users");
    users.value = data.users || [];
  } catch (e) {
    error.value = e?.response?.data?.message || "Failed to load users";
  } finally {
    loading.value = false;
  }
}

async function updateRole(id, role) {
  try {
    const { data } = await api.put(`/users/${id}/role`, { role });
    users.value = users.value.map((u) =>
      u.id === id ? { ...u, role: data.role } : u
    );
  } catch (e) {
    error.value = e?.response?.data?.message || "Failed to update role";
  }
}

onMounted(load);
</script>

<template>
  <section class="grid">
    <div class="card">
      <h2>User Management</h2>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="loading" class="meta">Loading…</p>

      <table v-if="!loading && users.length" class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Role</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.id }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.role }}</td>
            <td>
              <select
                :value="u.role"
                :disabled="u.id === user.id"
                @change="updateRole(u.id, $event.target.value)"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else-if="!loading" class="meta">No users</p>
    </div>
  </section>
</template>

<style scoped>
.error {
  color: red;
}
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}
th,
td {
  border-bottom: 1px solid #222;
  padding: 8px;
  text-align: left;
}
select {
  background: #161b22;
  color: #c9d1d9;
  border: 1px solid #30363d;
  padding: 4px 8px;
  border-radius: 6px;
}
</style>
