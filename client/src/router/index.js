import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "../composables/useAuth";
import Home from "../pages/Home.vue";
import ViewArticle from "../pages/ViewArticle.vue";
import CreateArticle from "../pages/CreateArticle.vue";
import EditArticle from "../pages/EditArticle.vue";
import Workspaces from "../pages/Workspaces.vue";
import CreateWorkspace from "../pages/CreateWorkspace.vue";
import EditWorkspace from "../pages/EditWorkspace.vue";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import Users from "../pages/Users.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login, meta: { public: true } },
  { path: "/register", component: Register, meta: { public: true } },
  { path: "/articles/:id", component: ViewArticle },
  { path: "/articles/:id/edit", component: EditArticle },
  { path: "/create", component: CreateArticle },
  { path: "/workspaces", component: Workspaces },
  { path: "/workspaces/create", component: CreateWorkspace },
  { path: "/workspaces/:id/edit", component: EditWorkspace },
  { path: "/users", component: Users, meta: { adminOnly: true } },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  if (to.meta.public) return true;

  if (!isAuthenticated.value) {
    logout();
    return "/login";
  }

  if (to.meta.adminOnly && !isAdmin.value) {
    return "/";
  }

  return true;
});

router.beforeEach((to) => {
  const { isAuthenticated, logout } = useAuth();

  if (to.meta.public) return true;

  if (!isAuthenticated.value) {
    logout();
    return "/login";
  }

  return true;
});

export default router;
