import fsSync from 'fs'
import fs from 'fs/promises'
import path from 'path'
import { emit } from "../sockets/io.js"
import { createSchema, updateSchema } from '../validators/articleSchemas.js'
import { readArticle, saveArticle, getNextId } from '../services/articles.js'
import { dataDir, uploadDir } from '../config/index.js'

export async function listArticles(req, res, next) {
  try {
    const files = await fs.readdir(dataDir)
    const out = []

    for (const f of files) {
      if (!f.endsWith('.json')) continue
      try {
        const raw = await fs.readFile(path.join(dataDir, f), 'utf-8')
        const { id, title, createdAt } = JSON.parse(raw)
        out.push({ id, title, createdAt })
      } catch { }
    }

    out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(out)
  } catch (e) { next(e) }
}

export async function getArticle(req, res, next) {
  try {
    const id = req.params.id
    if (!/^\d+$/.test(id))
      return next({ status: 400, message: 'Invalid id' })

    const article = await readArticle(id)
    res.json(article)
  } catch (e) {
    if (e.code === 'ENOENT')
      return next({ status: 404, message: 'Not found' })
    next(e)
  }
}

export async function createArticle(req, res, next) {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message });

    const files = req.files || [];

    if (files.length > 10) {
      return next({ status: 400, message: "Maximum 10 attachments allowed" });
    }

    const id = await getNextId();
    const now = new Date().toISOString();

    const articleFolder = path.join(uploadDir, String(id));
    if (!fsSync.existsSync(articleFolder)) {
      fsSync.mkdirSync(articleFolder, { recursive: true });
    }

    const attachments = [];

    // Upload article attachments
    for (const f of files) {
      const oldPath = f.path;
      const newFileName = f.filename;
      const newPath = path.join(articleFolder, newFileName);

      fsSync.renameSync(oldPath, newPath);

      attachments.push({
        filename: newFileName,
        originalName: f.originalname,
        mimeType: f.mimetype,
        url: `/uploads/${id}/${newFileName}`,
        uploadedAt: now
      });
    }

    // Construct article JSON
    const record = {
      id,
      title: value.title,
      content: value.content,
      createdAt: now,
      updatedAt: now,
      attachments
    };

    await saveArticle(record);

    res.status(201).json(record);
  } catch (e) {
    next(e);
  }
}

export async function updateArticle(req, res, next) {
  try {
    const id = req.params.id;
    const { title, content, deleted = "[]" } = req.body;

    // Load existing article
    const article = await readArticle(id);

    // Ensure article attachments array exists
    if (!Array.isArray(article.attachments)) {
      article.attachments = [];
    }

    let removedList = [];
    try {
      removedList = JSON.parse(deleted);
      if (!Array.isArray(removedList)) throw new Error();
    } catch {
      return next({
        status: 400,
        message: "Invalid deleted list format (must be array JSON).",
      });
    }

    //  Delete files from disk
    const articleFolder = path.join(uploadDir, String(id));

    for (const filename of removedList) {
      const filePath = path.join(articleFolder, filename);

      console.log(fsSync.existsSync(filePath))
      if (fsSync.existsSync(filePath)) {
        try {
          fsSync.unlinkSync(filePath);
        } catch (err) {
          console.warn("Failed to delete file:", filePath, err.message);
        }
      }
    }

    // Remove deleted from metadata JSON
    article.attachments = article.attachments.filter(
      (att) => !removedList.includes(att.filename)
    );

    // Add new files
    const incomingFiles = req.files || [];

    // Enforce 10 max attachments
    if (article.attachments.length + incomingFiles.length > 10) {
      return next({
        status: 400,
        message: "Maximum 10 attachments allowed per article",
      });
    }
    // Ensure folder exists
    if (!fsSync.existsSync(articleFolder)) {
      fsSync.mkdirSync(articleFolder, { recursive: true });
    }

    const now = new Date().toISOString();

    for (const f of incomingFiles) {
      const newFilename = `${Date.now()}-${f.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
      const newPath = path.join(articleFolder, newFilename);

      // Move from tmp -> /uploads/:id/
      fsSync.renameSync(f.path, newPath);

      article.attachments.push({
        filename: newFilename,
        originalName: f.originalname,
        mimeType: f.mimetype,
        url: `/uploads/${id}/${newFilename}`,
        uploadedAt: now,
      });
    }

    //  Update text fields
    if (title) article.title = title;
    if (content) article.content = content;

    article.updatedAt = now;

    await saveArticle(article);

    // Notify via WS
    emit("article-updated", {
      type: "updated",
      id,
      title: article.title,
      timestamp: now,
    });

    res.json(article);

  } catch (e) {
    next(e);
  }
}

export async function deleteArticle(req, res, next) {
  try {
    const id = req.params.id;

    if (!/^\d+$/.test(id)) {
      return next({ status: 400, message: "Invalid id" });
    }

    // Load article first
    let article;
    try {
      article = await readArticle(id);
    } catch {
      return next({ status: 404, message: "Article not found" });
    }

    const articleFolder = path.join(uploadDir, String(id));

    // Delete article attachments
    if (fsSync.existsSync(articleFolder)) {
      try {
        fsSync.rmSync(articleFolder, { recursive: true, force: true });
      } catch (err) {
        console.warn("Failed to delete folder:", articleFolder, err.message);
      }
    }

    // Delete article JSON file
    const p = path.join(dataDir, `${id}.json`);
    try {
      await fs.unlink(p);
    } catch (err) {
      if (err.code === "ENOENT") {
        return next({ status: 404, message: "Article not found" });
      }
      throw err;
    }

    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
