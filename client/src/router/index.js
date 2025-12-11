import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import ViewArticle from "../pages/ViewArticle.vue";
import CreateArticle from "../pages/CreateArticle.vue";
import EditArticle from "../pages/EditArticle.vue";
import Workspaces from "../pages/Workspaces.vue";
import CreateWorkspace from "../pages/CreateWorkspace.vue";
import EditWorkspace from "../pages/EditWorkspace.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/articles/:id", name: "view-article", component: ViewArticle },
  {
    path: "/articles/:id/edit",
    name: "edit-article",
    component: EditArticle,
  },
  { path: "/create", name: "create-article", component: CreateArticle },
  {
    path: "/workspaces",
    name: "workspaces",
    component: Workspaces,
  },
  {
    path: "/workspaces/create",
    name: "create-workspace",
    component: CreateWorkspace,
  },
  {
    path: "/workspaces/:id/edit",
    name: "edit-workspace",
    component: EditWorkspace,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
