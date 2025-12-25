<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "../plugins/axios";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const { setToken } = useAuth();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function submit() {
  error.value = "";
  loading.value = true;

  try {
    const { data } = await axios.post("/auth/login", {
      email: email.value,
      password: password.value,
    });

    setToken(data.token);
    router.push("/");
  } catch (e) {
    error.value = e?.response?.data?.message || "Login failed";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="auth-page">
    <h2>Login</h2>

    <p v-if="error" class="error">{{ error }}</p>

    <form @submit.prevent="submit" class="auth-form">
      <input v-model="email" type="email" placeholder="Email" required />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />

      <button class="button" type="submit" :disabled="loading">
        {{ loading ? "Logging in…" : "Login" }}
      </button>
    </form>

    <p class="meta">
      No account?
      <router-link to="/register">Register</router-link>
    </p>
  </section>
</template>

<style>
.auth-page {
  max-width: 360px;
  margin: 40px auto;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.error {
  color: red;
}
</style>
