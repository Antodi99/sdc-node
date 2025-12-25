<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "../plugins/axios";

const router = useRouter();

const email = ref("");
const password = ref("");
const confirm = ref("");
const error = ref("");
const loading = ref(false);

async function submit() {
  error.value = "";

  if (password.value !== confirm.value) {
    error.value = "Passwords do not match";
    return;
  }

  loading.value = true;

  try {
    await axios.post("/auth/register", {
      email: email.value,
      password: password.value,
    });

    router.push("/login");
  } catch (e) {
    error.value = e?.response?.data?.message || "Registration failed";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="auth-page">
    <h2>Register</h2>

    <p v-if="error" class="error">{{ error }}</p>

    <form @submit.prevent="submit" class="auth-form">
      <input v-model="email" type="email" placeholder="Email" required />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />

      <input
        v-model="confirm"
        type="password"
        placeholder="Confirm password"
        required
      />

      <button class="button" type="submit" :disabled="loading">
        {{ loading ? "Creating…" : "Register" }}
      </button>
    </form>

    <p class="meta">
      Already have an account?
      <router-link to="/login">Login</router-link>
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
