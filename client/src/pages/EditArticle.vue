<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "../plugins/axios";
import { QuillEditor } from "@vueup/vue-quill";

const route = useRoute();
const router = useRouter();

const title = ref("");
const content = ref("");
const existingAttachments = ref([]);
const newFiles = ref([]);
const deletedAttachments = ref([]);

const error = ref("");
const loading = ref(false);

const workspaces = ref([]);
const workspaceId = ref(null);

const MAX = 10;

const totalCount = computed(
  () => existingAttachments.value.length + newFiles.value.length
);

async function loadWorkspaces() {
  const { data } = await axios.get("/workspaces");
  workspaces.value = data;
}

async function load() {
  error.value = "";
  try {
    await loadWorkspaces();

    const { data } = await axios.get(`/articles/${route.params.id}`);
    title.value = data.title;
    content.value = data.content;
    existingAttachments.value = data.attachments || [];
    workspaceId.value = data.workspaceId;
  } catch (e) {
    error.value = e?.response?.data?.error?.message || e.message;
  }
}

function chooseFiles(e) {
  error.value = "";
  const selected = Array.from(e.target.files);
  const allowed = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
  const bad = selected.find((f) => !allowed.includes(f.type));
  if (bad) {
    error.value = "Only JPG, PNG, GIF or PDF allowed.";
    return;
  }

  if (totalCount.value + selected.length > MAX) {
    error.value = `Max ${MAX} attachments allowed`;
    return;
  }

  newFiles.value.push(
    ...selected.map((f) => ({
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
    }))
  );
  e.target.value = "";
}

function removeNewFile(idx) {
  newFiles.value.splice(idx, 1);
}

function removeExisting(att) {
  deletedAttachments.value.push(att);
  existingAttachments.value = existingAttachments.value.filter(
    (a) => a.fileName !== att.fileName
  );
}

function previewFile(file) {
  if (file.type?.startsWith("image/")) return URL.createObjectURL(file);
  return null;
}

function isImage(att) {
  return att.mimeType?.startsWith("image/");
}

async function save() {
  loading.value = true;
  error.value = "";

  try {
    const fd = new FormData();
    fd.append("title", title.value);
    fd.append("content", content.value);
    fd.append("workspaceId", workspaceId.value);
    fd.append(
      "deleted",
      JSON.stringify(deletedAttachments.value.map((a) => a.fileName))
    );

    for (const f of newFiles.value) {
      fd.append("files", f.file);
    }

    await axios.put(`/articles/${route.params.id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    router.push(`/articles/${route.params.id}`);
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
      <router-link
        class="button secondary"
        :to="`/articles/${route.params.id}`"
      >
        Back
      </router-link>
      <h2>Edit Article</h2>

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
      <QuillEditor v-model:content="content" theme="snow" contentType="html" />

      <!-- EXISTING FILES -->
      <div v-if="existingAttachments.length" class="list-wrap">
        <h4>Existing attachments</h4>

        <div
          v-for="att in existingAttachments"
          :key="att.fileName"
          class="file-row"
        >
          <img v-if="isImage(att)" :src="att.url" class="thumb" />
          <a class="fname" :href="att.url" target="_blank">
            {{ att.originalName }}
          </a>
          <button class="remove" @click="removeExisting(att)">
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
      <p v-else class="meta">No attachments yet.</p>

      <label>Add new attachments</label>
      <input type="file" multiple @change="chooseFiles" />
      <p class="meta">Total attachments: {{ totalCount }} / {{ MAX }}</p>

      <div v-if="newFiles.length" class="list-wrap">
        <div v-for="(f, idx) in newFiles" :key="idx" class="file-row">
          <img
            v-if="previewFile(f.file)"
            :src="previewFile(f.file)"
            class="thumb"
          />
          <div class="fname">
            {{ f.name }} ({{ (f.size / 1024).toFixed(1) }} KB)
          </div>
          <button class="remove" @click="removeNewFile(idx)">
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
        <button class="button" :disabled="loading" @click="save">
          {{ loading ? "Saving..." : "Save changes" }}
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
  border-radius: 4px;
}
.thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
}
.fname {
  flex: 1;
  text-decoration: none;
  color: white;
}
.remove {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #c00;
}
</style>
