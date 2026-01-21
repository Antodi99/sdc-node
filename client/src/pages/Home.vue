<script setup>
import { onMounted, ref, watch } from "vue";
import axios from "../plugins/axios";

const loading = ref(false);
const error = ref(null);
const articles = ref([]);
const search = ref("");
const page = ref(1);
const pages = ref(1);
const limit = 10;

const workspaces = ref([]);
const activeWorkspaceId = ref(null);

async function loadWorkspaces() {
  const { data } = await axios.get("/workspaces");
  workspaces.value = data;
  if (!activeWorkspaceId.value && data.length) {
    activeWorkspaceId.value = data[0].id;
  }
}

async function loadArticles() {
  if (!activeWorkspaceId.value) return;

  loading.value = true;
  error.value = null;

  try {
    const { data } = await axios.get("/articles", {
      params: {
        workspaceId: activeWorkspaceId.value,
        q: search.value || undefined,
        page: page.value,
        limit,
      },
    });

    articles.value = data.items;
    pages.value = data.pages;
  } catch (e) {
    error.value = e?.response?.data?.message || e.message;
  } finally {
    loading.value = false;
  }
}

// reload when workspace changes
watch(activeWorkspaceId, () => {
  page.value = 1;
  loadArticles();
});

// debounce search
let timer = null;
watch(search, () => {
  clearTimeout(timer);
  timer = setTimeout(loadArticles, 300);
});

onMounted(async () => {
  try {
    await loadWorkspaces();
    await loadArticles();
  } catch (e) {
    error.value = e?.response?.data?.error?.message || e.message;
  }
});
</script>

<template>
  <section class="grid">
    <div>
      <div class="card">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <h2 style="margin: 0">Latest Articles</h2>
          <router-link class="button" to="/create">+ New</router-link>
        </div>

        <!-- SEARCH -->
        <input
          v-model="search"
          placeholder="Search by title or content…"
          class="search-input"
        />

        <!-- WORKSPACE SELECTOR -->
        <div style="margin: 0.75rem 0">
          <span class="meta">Workspace:</span>
          <button
            v-for="ws in workspaces"
            :key="ws.id"
            class="chip"
            :class="{ active: ws.id === activeWorkspaceId }"
            @click="activeWorkspaceId = ws.id"
          >
            {{ ws.label }}
          </button>
          <span v-if="!workspaces.length" class="meta">
            No workspaces yet. Create one in the Workspaces menu.
          </span>
        </div>

        <p v-if="loading" class="meta">Loading…</p>
        <p v-if="error" class="error">{{ error }}</p>

        <div v-if="!loading && !error">
          <div v-for="a in articles" :key="a.id" class="row">
            <div>
              <router-link :to="'/articles/' + a.id">
                <strong>{{ a.title }}</strong>
              </router-link>
              <div class="meta">
                #{{ a.id }} · {{ new Date(a.createdAt).toLocaleString() }}
              </div>
            </div>
            <router-link class="button" :to="'/articles/' + a.id">
              Open
            </router-link>
          </div>

          <p v-if="!articles.length" class="meta">No articles found.</p>

          <div v-if="pages > 1" class="pagination">
            <button :disabled="page === 1" @click="page-- && loadArticles()">
              Prev
            </button>

            <span>Page {{ page }} / {{ pages }}</span>

            <button
              :disabled="page === pages"
              @click="page++ && loadArticles()"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <aside>
      <div class="card">
        <h3 style="margin-top: 0">About</h3>
        <p class="meta">
          Forum-like app where you can create, view, and list articles
        </p>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.pagination {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 1rem;
}
.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.search-input {
  width: 100%;
  margin: 12px 0;
  padding: 8px 10px;
  background: #161b22;
  border: 1px solid #30363d;
  color: #c9d1d9;
  border-radius: 6px;
}

.chip {
  margin-left: 0.5rem;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #444;
  background: #111;
  cursor: pointer;
  color: white;
  font-size: 12px;
}

.chip.active {
  background: #5865f2;
  border-color: #5865f2;
}
</style>
