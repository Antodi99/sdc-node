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

const MAX = 10;

const totalCount = computed(
  () => existingAttachments.value.length + newFiles.value.length
);

const canAddMore = computed(() => {
  console.log(totalCount.value);
  return totalCount.value < MAX;
});

function chooseFiles(e) {
  if (!canAddMore.value) {
    error.value = `You can attach max ${MAX} files`;
    return;
  }

  const selected = Array.from(e.target.files);
  const allowed = ["image/jpeg", "image/png", "image/gif", "application/pdf"];

  const invalid = selected.filter((f) => !allowed.includes(f.type));
  if (invalid.length) {
    error.value = "Only JPG, PNG, GIF or PDF allowed.";
    return;
  }

  if (totalCount.value + selected.length > MAX) {
    error.value = `Max ${MAX} attachments allowed`;
    return;
  }

  newFiles.value.push(...selected);
}

function removeNewFile(idx) {
  newFiles.value.splice(idx, 1);
}

function removeExistingFile(fn) {
  deletedAttachments.value.push(fn);
  existingAttachments.value = existingAttachments.value.filter(
    (a) => a.filename !== fn
  );
}

function previewFile(file) {
  if (file.type?.startsWith("image/")) return URL.createObjectURL(file);
  return null;
}

async function load() {
  try {
    const { data } = await axios.get(`/articles/${route.params.id}`);
    title.value = data.title;
    content.value = data.content;
    existingAttachments.value = data.attachments || [];
  } catch (e) {
    error.value = e?.response?.data?.error?.message || e.message;
  }
}

async function save() {
  error.value = "";
  loading.value = true;

  try {
    const fd = new FormData();
    fd.append("title", title.value);
    fd.append("content", content.value);
    fd.append("deleted", JSON.stringify(deletedAttachments.value));

    for (const f of newFiles.value) {
      fd.append("files", f);
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
      <h2>Edit Article</h2>

      <p v-if="error" class="error">{{ error }}</p>

      <label>Title</label>
      <input v-model="title" />

      <label>Content</label>
      <QuillEditor v-model:content="content" theme="snow" contentType="html" />

      <!-- EXISTING FILES -->
      <div v-if="existingAttachments.length" class="files-wrap">
        <h4>Existing attachments</h4>

        <div
          v-for="att in existingAttachments"
          :key="att.filename"
          class="file-row"
        >
          <img
            v-if="att.mimeType.startsWith('image/')"
            :src="att.url"
            class="thumb"
          />

          <a :href="att.url" target="_blank" class="fname">
            {{ att.originalName }}
          </a>

          <button class="remove" @click="removeExistingFile(att.filename)">
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

      <!-- ADD NEW -->
      <label style="margin-top: 1rem">Add attachments</label>
      <input
        type="file"
        multiple
        @change="chooseFiles"
        :disabled="!canAddMore"
      />
      <p v-if="!canAddMore" class="error">Max {{ MAX }} attachments reached</p>

      <!-- PREVIEW NEW FILES -->
      <div v-if="newFiles.length" class="files-wrap">
        <div v-for="(f, idx) in newFiles" :key="idx" class="file-row">
          <img v-if="previewFile(f)" :src="previewFile(f)" class="thumb" />

          <span class="fname">{{ f.name }}</span>

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
.files-wrap {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.file-row {
  display: flex;
  align-items: center;
  background: #0d1117;
  border: 1px solid #242a36;
  padding: 6px;
  border-radius: 6px;
  gap: 10px;
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
