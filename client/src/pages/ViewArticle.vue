<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "../plugins/axios";

const route = useRoute();
const router = useRouter();

const article = ref(null);
const error = ref(null);
const comments = ref([]);
const newComment = ref("");
const author = ref("");
const commentError = ref("");
const submittingComment = ref(false);
const editingCommentId = ref(null);
const editingContent = ref("");
const editingLoading = ref(false);

async function load() {
  try {
    const { data } = await axios.get(`/articles/${route.params.id}`);
    article.value = data;
    comments.value = data.comments || [];
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

async function submitComment() {
  if (!newComment.value.trim()) return;

  submittingComment.value = true;
  commentError.value = "";

  try {
    const { data } = await axios.post(`/articles/${route.params.id}/comments`, {
      author: author.value || null,
      content: newComment.value,
    });
    comments.value.push(data);
    newComment.value = "";
  } catch (e) {
    commentError.value = e?.response?.data?.error?.message || e.message;
  } finally {
    submittingComment.value = false;
  }
}

async function deleteComment(id) {
  if (!confirm("Delete this comment?")) return;
  try {
    await axios.delete(`/comments/${id}`);
    comments.value = comments.value.filter((c) => c.id !== id);
    if (editingCommentId.value === id) {
      editingCommentId.value = null;
      editingContent.value = "";
    }
  } catch (e) {
    commentError.value = e?.response?.data?.error?.message || e.message;
  }
}

function startEditComment(comment) {
  editingCommentId.value = comment.id;
  editingContent.value = comment.content;
  commentError.value = "";
}

function cancelEditComment() {
  editingCommentId.value = null;
  editingContent.value = "";
}

async function saveEditComment(id) {
  if (!editingContent.value.trim()) {
    commentError.value = "Comment content cannot be empty.";
    return;
  }

  editingLoading.value = true;
  commentError.value = "";

  try {
    const { data } = await axios.put(`/comments/${id}`, {
      content: editingContent.value,
    });

    comments.value = comments.value.map((c) =>
      c.id === id
        ? { ...c, content: data.content, updatedAt: data.updatedAt }
        : c
    );

    editingCommentId.value = null;
    editingContent.value = "";
  } catch (e) {
    commentError.value = e?.response?.data?.error?.message || e.message;
  } finally {
    editingLoading.value = false;
  }
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
        <span v-if="article.workspace"> · {{ article.workspace.label }} </span>
      </div>

      <div style="margin-top: 1rem">
        <router-link class="button" :to="`/articles/${article?.id}/edit`">
          Edit
        </router-link>
        <button class="button secondary" style="margin-left: 8px" @click="del">
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
            :key="att.fileName || att.filename || att.id"
            class="file-row"
          >
            <img v-if="isImage(att)" :src="att.url" class="thumb" />

            <a class="fname link" :href="att.url" target="_blank">
              {{ att.originalName || att.originalFilename }}
            </a>
          </div>
        </div>
      </div>

      <!-- Comments -->
      <div class="card" style="margin-top: 1.5rem">
        <h3>Comments</h3>

        <p v-if="commentError" class="error">{{ commentError }}</p>

        <form @submit.prevent="submitComment" class="comment-form">
          <input v-model="author" placeholder="Your name (optional)" />
          <textarea
            v-model="newComment"
            rows="3"
            class="comment-body"
            placeholder="Add a comment…"
            required
          ></textarea>
          <button
            class="button"
            type="submit"
            :disabled="submittingComment || !newComment.trim()"
          >
            {{ submittingComment ? "Posting…" : "Post Comment" }}
          </button>
        </form>

        <p v-if="!comments.length" class="meta">No comments yet.</p>

        <ul v-else class="comment-list">
          <li v-for="c in comments" :key="c.id" class="comment">
            <div class="comment-header">
              <strong>{{ c.author || "Anonymous" }}</strong>
              <span class="meta">
                {{ new Date(c.createdAt).toLocaleString() }}
                <span v-if="c.updatedAt && c.updatedAt !== c.createdAt">
                  · edited
                </span>
              </span>
              <div style="display: flex; gap: 0.5rem; align-items: center">
                <button
                  class="link small"
                  type="button"
                  @click="startEditComment(c)"
                >
                  Edit
                </button>
                <button
                  class="link small"
                  type="button"
                  @click="deleteComment(c.id)"
                >
                  Delete
                </button>
              </div>
            </div>

            <div v-if="editingCommentId === c.id" class="edit-block">
              <textarea
                class="comment-body"
                v-model="editingContent"
                rows="3"
                style="width: 100%; margin-top: 0.5rem"
              ></textarea>
              <div style="margin-top: 0.25rem; display: flex; gap: 0.5rem">
                <button
                  class="button small"
                  type="button"
                  @click="saveEditComment(c.id)"
                  :disabled="editingLoading"
                >
                  {{ editingLoading ? "Saving…" : "Save" }}
                </button>
                <button
                  class="button secondary small"
                  type="button"
                  @click="cancelEditComment"
                  :disabled="editingLoading"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div v-else class="comment-body">
              {{ c.content }}
            </div>
          </li>
        </ul>
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
  border: none;
  background: none;
  cursor: pointer;
}
.link.small {
  font-size: 12px;
}
.link:hover {
  text-decoration: underline;
}

.comment-body {
  margin-top: 0.35rem;
  padding: 6px 8px;
  background: #0d1117;
  color: white;
  border: 1px solid #242a36;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
  resize: vertical;
  overflow-y: auto;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.comment {
  padding: 0.5rem 0;
  border-bottom: 1px solid #222;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}

.button.small {
  padding: 4px 10px;
  font-size: 12px;
}
.button.secondary.small {
  background: transparent;
  border-color: #444;
}
</style>
