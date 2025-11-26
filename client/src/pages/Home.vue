<script setup>
import { onMounted, ref } from "vue";
import axios from "../plugins/axios";

const loading = ref(false);
const error = ref(null);
const articles = ref([]);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await axios.get("/articles");
    articles.value = data;
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
        <p v-if="loading" class="meta">Loading…</p>
        <p v-if="error" class="error">{{ error }}</p>
        <div v-if="!loading">
          <div v-for="a in articles" :key="a.id" class="row">
            <div>
              <router-link :to="'/articles/' + a.id"
                ><strong>{{ a.title }}</strong></router-link
              >
              <div class="meta">
                #{{ a.id }} · {{ new Date(a.createdAt).toLocaleString() }}
              </div>
            </div>
            <router-link class="button" :to="'/articles/' + a.id"
              >Open</router-link
            >
          </div>
          <p v-if="!articles.length" class="meta">No posts yet.</p>
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
