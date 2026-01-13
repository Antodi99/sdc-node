import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";

import { initSocket } from "./sockets/io.js";
import { ORIGIN, PORT, uploadDir } from "./config/index.js";
import { ensureDirs } from "./utils/ensureDirs.js";
import articleRoutes from "./routes/articles.js";
import commentRoutes from "./routes/comments.js";
import workspaceRoutes from "./routes/workspaces.js";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import { requireAuth } from "./middleware/requireAuth.js";

// Ensure directories
ensureDirs();

// Create HTTP + Socket server
const app = express();
const server = http.createServer(app);

// Initialize socket.io
initSocket(server);

// Middleware
app.use(cors({ origin: ORIGIN }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadDir));

// Healthcheck
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/articles", requireAuth, articleRoutes);
app.use("/api/comments", requireAuth, commentRoutes);
app.use("/api/workspaces", requireAuth, workspaceRoutes);

// 404
app.use((req, _res, next) => {
  next({ status: 404, message: `Not found: ${req.method} ${req.originalUrl}` });
});

// Error handler
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ error: { message: err.message, status } });
});

// Start server
server.listen(PORT, () =>
  console.log(`API running on http://localhost:${PORT}`)
);
