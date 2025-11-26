import multer from "multer";
import fs from "fs";
import path from "path";
import { uploadDir } from "../config/index.js";

const allowedMime = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf"
];

function ensureArticleDir(articleId) {
  const dir = path.join(uploadDir, String(articleId));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    let articleId = req.params.id;

    // If creating article → no folder yet
    if (!articleId) {
      // Use temporary staging area: /uploads/tmp
      const tmpPath = path.join(uploadDir, "tmp");
      if (!fs.existsSync(tmpPath)) {
        fs.mkdirSync(tmpPath, { recursive: true });
      }
      return cb(null, tmpPath);
    }

    // Editing -> upload into article directory
    const dir = ensureArticleDir(articleId);
    cb(null, dir);
  },

  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const prefix = Date.now(); // ONLY timestamp
    cb(null, `${prefix}-${safeName}`);
  }
});

function fileFilter(_req, file, cb) {
  if (!allowedMime.includes(file.mimetype)) {
    return cb(new Error("Only images and PDFs allowed"));
  }
  cb(null, true);
}

export const uploadMany = multer({
  storage,
  fileFilter
}).array("files", 10);
