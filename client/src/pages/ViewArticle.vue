<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "../plugins/axios";

const route = useRoute();
const router = useRouter();

const article = ref(null);
const error = ref(null);

async function load() {
  try {
    const { data } = await axios.get(`/articles/${route.params.id}`);
    article.value = data;
  } catch (e) {
    error.value = e?.response?.data?.error?.message || e.message;
  }
}

async function del() {
  if (!confirm("Delete this article?")) return;
  try {
    await axios.delete(`/articles/${route.params.id}`);
    router.push("/");
  } catch (e) {
    alert(e?.response?.data?.error?.message || e.message);
  }
}

function isImage(att) {
  return att.mimeType?.startsWith("image/");
}

onMounted(load);
</script>

<template>
  <section class="grid">
    <div class="card">
      <router-link class="button secondary" to="/">← Back</router-link>

      <h2 v-if="article">{{ article.title }}</h2>

      <div class="meta" v-if="article">
        #{{ article.id }} · {{ new Date(article.createdAt).toLocaleString() }}
      </div>

      <div style="margin-top: 1rem">
        <router-link class="button" :to="`/articles/${article?.id}/edit`">
          Edit
        </router-link>

        <button
          class="button"
          style="margin-left: 1rem; background-color: red"
          @click="del"
        >
          Delete
        </button>
      </div>

      <div
        v-if="article"
        class="card"
        style="margin-top: 1rem"
        v-html="article.content"
      ></div>

      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="article?.attachments?.length" class="attachments-block">
        <h3>Attachments</h3>

        <div class="list-wrap">
          <div
            v-for="att in article.attachments"
            :key="att.filename"
            class="file-row"
          >
            <img v-if="isImage(att)" :src="att.url" class="thumb" />

            <a class="fname link" :href="att.url" target="_blank">
              {{ att.originalName }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.error {
  color: red;
  margin-top: 5px;
}

.attachments-block {
  margin-top: 1rem;
}

.list-wrap {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  background: #0d1117;
  color: white;
  border: 1px solid #242a36;
  border-radius: 6px;
}

.thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
}

.fname {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link {
  color: #58a6ff;
}
.link:hover {
  text-decoration: underline;
}
</style>
