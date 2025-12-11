import fsSync from 'fs'
import fs from 'fs/promises'
import path from 'path'
import { emit } from "../sockets/io.js"
import { createSchema, updateSchema } from '../validators/articleSchemas.js'
import { uploadDir } from '../config/index.js'
import { serializeArticle } from "../serializers/articleSerializer.js";
import db from "../database/models/index.js";

const { Article, Workspace, Attachment, Comment } = db;

export async function listArticles(req, res, next) {
  try {
    const where = {};
    if (req.query.workspaceId) {
      where.workspaceId = Number(req.query.workspaceId);
    }

    const articles = await Article.findAll({
      where,
      include: [
        {
          model: Workspace,
          as: "workspace",
          attributes: ["id", "name", "label"],
        },
      ],
      order: [["createdAt", "DESC"]],
      attributes: ["id", "title", "createdAt", "updatedAt", "workspaceId"],
    });

    res.json(articles);
  } catch (e) {
    next(e);
  }
}

export async function getArticle(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return next({ status: 400, message: "Invalid id" });
    }

    const article = await Article.findByPk(id, {
      include: [
        { model: Workspace, as: "workspace", attributes: ["id", "name", "label"] },
        { model: Attachment, as: "attachments" },
        {
          model: Comment,
          as: "comments",
          order: [["createdAt", "ASC"]],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!article) {
      return next({ status: 404, message: "Nnot found" });
    }

    return res.json(serializeArticle(article));
  } catch (e) {
    next(e);
  }
}

export async function createArticle(req, res, next) {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) {
      return next({ status: 400, message: error.message });
    }

    const { title, content, workspaceId } = value;
    const workspace = await Workspace.findByPk(workspaceId);
    if (!workspace) {
      return next({ status: 400, message: "Invalid workspaceId" });
    }

    const now = new Date();

    // Create article (without attachments yet)
    const article = await Article.create({
      title,
      content,
      workspaceId,
      createdAt: now,
      updatedAt: now,
    });

    // Move files from /uploads/tmp to /uploads/:articleId
    const files = req.files || [];
    const articleFolder = path.join(uploadDir, String(article.id));
    if (!fsSync.existsSync(articleFolder)) {
      fsSync.mkdirSync(articleFolder, { recursive: true });
    }

    for (const f of files) {
      const oldPath = f.path; // in /uploads/tmp
      const newFileName = f.filename;
      const newPath = path.join(articleFolder, newFileName);

      fsSync.renameSync(oldPath, newPath);

      await Attachment.create({
        articleId: article.id,
        serverFilename: newFileName,
        originalFilename: f.originalname,
        mimeType: f.mimetype,
        uploadedAt: now,
      });
    }

    const fullArticle = await Article.findByPk(article.id, {
      include: [{ model: Attachment, as: "attachments" }, { model: Workspace, as: "workspace" }],
    });

    emit("article-created", {
      type: "created",
      id: article.id,
      title: article.title,
      timestamp: now.toISOString(),
    });

    res.status(201).json(fullArticle);
  } catch (e) {
    next(e);
  }
}

export async function updateArticle(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return next({ status: 400, message: "Invalid id" });
    }

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return next({ status: 400, message: error.message });
    }

    const article = await Article.findByPk(id, {
      include: [{ model: Attachment, as: "attachments" }],
    });

    if (!article) {
      return next({ status: 404, message: "Article not found" });
    }

    // Update fields
    if (value.title) article.title = value.title;
    if (value.content) article.content = value.content;
    if (value.workspaceId) {
      const ws = await Workspace.findByPk(value.workspaceId);
      if (!ws) {
        return next({ status: 400, message: "Invalid workspaceId" });
      }
      article.workspaceId = value.workspaceId;
    }

    const now = new Date();
    article.updatedAt = now;

    // Handle deleted attachments
    const articleFolder = path.join(uploadDir, String(id));
    if (value.deleted) {
      let removedList = [];
      try {
        removedList = JSON.parse(value.deleted);
        if (!Array.isArray(removedList)) throw new Error();
      } catch {
        return next({
          status: 400,
          message: "Invalid deleted list format (must be array JSON).",
        });
      }

      for (const filename of removedList) {
        const filePath = path.join(articleFolder, filename);
        try {
          await fs.unlink(filePath);
        } catch (err) {
          if (err.code !== "ENOENT") throw err;
        }

        await Attachment.destroy({
          where: { articleId: id, serverFilename: filename },
        });
      }
    }

    // New uploads (multer already saved in /uploads/:id)
    const files = req.files || [];
    for (const f of files) {
      await Attachment.create({
        articleId: id,
        serverFilename: f.filename,
        originalFilename: f.originalname,
        mimeType: f.mimetype,
        uploadedAt: now,
      });
    }

    await article.save();

    const fullArticle = await Article.findByPk(id, {
      include: [
        { model: Attachment, as: "attachments" },
        { model: Comment, as: "comments" },
        { model: Workspace, as: "workspace", attributes: ["id", "name", "label"] },
      ],
    });

    emit("article-updated", {
      type: "updated",
      id,
      title: article.title,
      timestamp: now.toISOString(),
    });

    res.json(fullArticle);
  } catch (e) {
    next(e);
  }
}

export async function deleteArticle(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return next({ status: 400, message: "Invalid id" });
    }

    const article = await Article.findByPk(id);
    if (!article) {
      return next({ status: 404, message: "Article not found" });
    }

    // Remove files from /uploads/:id
    const articleFolder = path.join(uploadDir, String(id));
    try {
      const files = await fs.readdir(articleFolder);
      for (const f of files) {
        await fs.unlink(path.join(articleFolder, f));
      }
      await fs.rmdir(articleFolder);
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }

    await article.destroy();

    emit("article-deleted", {
      type: "deleted",
      id,
      timestamp: new Date().toISOString(),
    });

    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
