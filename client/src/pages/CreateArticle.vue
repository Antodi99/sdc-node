<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "../plugins/axios";
import { QuillEditor } from "@vueup/vue-quill";

const router = useRouter();
const title = ref("");
const content = ref("");
const files = ref([]);
const error = ref(null);
const loading = ref(false);

const workspaces = ref([]);
const workspaceId = ref(null);

async function loadWorkspaces() {
  const { data } = await axios.get("/workspaces");
  workspaces.value = data;
  if (!workspaceId.value && data.length) {
    workspaceId.value = data[0].id;
  }
}

onMounted(loadWorkspaces);

function chooseFiles(e) {
  error.value = "";
  const selected = Array.from(e.target.files);
  const allowed = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
  const bad = selected.find((f) => !allowed.includes(f.type));
  if (bad) {
    error.value = "Only JPG, PNG, GIF or PDF allowed.";
    return;
  }
  files.value.push(
    ...selected.map((f) => ({
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
    }))
  );
  e.target.value = "";
}

function removeFile(idx) {
  files.value.splice(idx, 1);
}

function previewFile(file) {
  if (file.type.startsWith("image/")) {
    return URL.createObjectURL(file);
  }
  return null;
}

async function submit() {
  loading.value = true;
  error.value = null;

  try {
    const fd = new FormData();
    fd.append("title", title.value);
    fd.append("content", content.value);
    fd.append("workspaceId", workspaceId.value);

    for (const f of files.value) {
      fd.append("files", f.file);
    }

    const { data } = await axios.post("/articles", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    router.push("/articles/" + data.id);
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
      <router-link class="button secondary" to="/">← Back</router-link>
      <h2>Create Article</h2>

      <p v-if="error" class="error">{{ error }}</p>

      <label>Title</label>
      <input v-model="title" />

      <label>Workspace</label>
      <select v-model="workspaceId">
        <option v-for="ws in workspaces" :key="ws.id" :value="ws.id">
          {{ ws.label }}
        </option>
      </select>

      <label>Content</label>
      <QuillEditor v-model:content="content" contentType="html" theme="snow" />

      <label>Attachments</label>
      <input type="file" multiple @change="chooseFiles" />

      <div v-if="files.length" class="list-wrap">
        <div v-for="(f, idx) in files" :key="idx" class="file-row">
          <img
            v-if="previewFile(f.file)"
            :src="previewFile(f.file)"
            class="thumb"
          />
          <div class="fname">
            {{ f.name }} ({{ (f.size / 1024).toFixed(1) }} KB)
          </div>
          <button class="remove" @click="removeFile(idx)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div style="margin-top: 1rem">
        <button class="button" :disabled="loading" @click="submit">
          {{ loading ? "Saving…" : "Save" }}
        </button>

        <router-link
          class="button secondary"
          to="/"
          style="margin-left: 0.5rem"
        >
          Cancel
        </router-link>
      </div>
    </div>
  </section>
</template>

<style>
.error {
  color: red;
  margin-top: 5px;
}

.list-wrap {
  margin-top: 1rem;
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
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove {
  border: none;
  background: transparent;
  font-size: 18px;
  color: #c00;
  cursor: pointer;
}
</style>
