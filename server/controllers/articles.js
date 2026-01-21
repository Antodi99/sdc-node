import fsSync from 'fs'
import fs from 'fs/promises'
import path from 'path'
import { Op, literal } from "sequelize";
import { emit } from "../sockets/io.js"
import { createSchema, updateSchema } from '../validators/articleSchemas.js'
import { uploadDir } from '../config/index.js'
import { serializeArticle } from "../serializers/articleSerializer.js";
import db from "../database/models/index.js";

const { Article, Workspace, Attachment, Comment, ArticleVersion } = db;

function applyVersion(article, version, attachments) {
  article.setDataValue("title", version.title);
  article.setDataValue("content", version.content);
  article.setDataValue("attachments", attachments);
}

export async function listArticles(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const offset = (page - 1) * limit;

    const where = {};

    if (req.query.workspaceId) {
      where.workspaceId = Number(req.query.workspaceId);
    }

    if (req.query.q) {
      const q = req.query.q.trim().replace(/'/g, "");

      where[Op.or] = [
        literal(`
          similarity(
            lower("Article"."title"),
            lower('${q}')
          ) > 0.3
        `),
        literal(`
          similarity(
            lower(regexp_replace("Article"."content", '<[^>]*>', '', 'g')),
            lower('${q}')
          ) > 0.3
        `),
      ];
    }

    const { rows, count } = await Article.findAndCountAll({
      where,
      attributes: ["id", "title", "createdAt", "workspaceId"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      items: rows,
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit),
    });
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
        { model: Comment, as: "comments", order: [["createdAt", "ASC"]] }
      ]
    });
    if (!article) {
      return next({ status: 404, message: "Not found" });
    }

    const versionNum = article.currentVersion || 1;

    const version = await ArticleVersion.findOne({
      where: { articleId: id, version: versionNum }
    });

    if (!version) {
      return next({ status: 404, message: "Version not found" });
    }

    const attachments = await Attachment.findAll({
      where: { articleId: id, articleVersionId: version.id }
    });

    applyVersion(article, version, attachments);

    return res.json({
      ...serializeArticle(article),
      viewVersion: versionNum,
      latestVersion: versionNum,
      isLatest: true,
      readonly: false,
    });

  } catch (e) {
    next(e);
  }
}

export async function listArticleVersions(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return next({ status: 400, message: "Invalid id" });
    }

    const article = await Article.findByPk(id);
    if (!article) {
      return next({ status: 404, message: "Article not found" });
    }

    const versions = await ArticleVersion.findAll({
      where: { articleId: id },
      order: [["version", "DESC"]],
      attributes: ["id", "version", "title", "createdAt"],
    });

    res.json({
      articleId: id,
      latestVersion: article.currentVersion || 1,
      versions,
    });
  } catch (e) {
    next(e);
  }
}

export async function getArticleVersion(req, res, next) {
  try {
    const id = Number(req.params.id);
    const versionNum = Number(req.params.version);

    if (!Number.isFinite(id) || !Number.isFinite(versionNum)) {
      return next({ status: 400, message: "Invalid id or version" });
    }

    const article = await Article.findByPk(id, {
      include: [
        { model: Comment, as: "comments", order: [["createdAt", "ASC"]] }
      ]
    });

    if (!article) {
      return next({ status: 404, message: "Article not found" });
    }

    const version = await ArticleVersion.findOne({
      where: { articleId: id, version: versionNum }
    });

    if (!version) {
      return next({ status: 404, message: "Version not found" });
    }

    const workspace = await Workspace.findByPk(version.workspaceId, {
      attributes: ["id", "name", "label"]
    });

    const attachments = await Attachment.findAll({
      where: { articleId: id, articleVersionId: version.id }
    });

    applyVersion(article, version, attachments);

    const latest = article.currentVersion || versionNum;
    const json = serializeArticle(article);
    json.workspace = workspace;
    json.viewVersion = versionNum;
    json.latestVersion = latest;
    json.isLatest = versionNum === latest;
    json.readonly = versionNum !== latest;

    res.json(json);
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
      creatorId: req.user.id,
      createdAt: now,
      updatedAt: now,
    });

    const version = await ArticleVersion.create({
      articleId: article.id,
      version: 1,
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
        articleVersionId: version.id,
        serverFilename: newFileName,
        originalFilename: f.originalname,
        mimeType: f.mimetype,
        uploadedAt: now,
      });
    }

    const attachments = await Attachment.findAll({
      where: { articleId: article.id, articleVersionId: version.id },
    });

    applyVersion(article, version, attachments);

    emit("article-created", {
      type: "created",
      id: article.id,
      title: article.title,
      timestamp: now.toISOString(),
    });

    res.status(201).json({
      ...serializeArticle(article),
      viewVersion: 1,
      latestVersion: 1,
      isLatest: true,
      readonly: false,
    });
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
      include: [{ model: Comment, as: "comments" }],
    });

    if (!article) {
      return next({ status: 404, message: "Article not found" });
    }

    if (req.user.role !== "admin" && article.creatorId !== req.user.id) {
      return next({ status: 403, message: "Forbidden" });
    }

    const now = new Date();

    const prevVersionNum = article.currentVersion || 1;

    if (value.title) article.title = value.title;
    if (value.content) article.content = value.content;
    if (value.workspaceId) {
      const ws = await Workspace.findByPk(value.workspaceId);
      if (!ws) {
        return next({ status: 400, message: "Invalid workspaceId" });
      }
      article.workspaceId = value.workspaceId;
    }

    const newVersion = prevVersionNum + 1;

    const version = await ArticleVersion.create({
      articleId: id,
      version: newVersion,
      title: article.title,
      content: article.content,
      workspaceId: article.workspaceId,
      createdAt: now,
      updatedAt: now,
    });

    article.currentVersion = newVersion;
    article.updatedAt = now;
    await article.save();

    const prevVersion = await ArticleVersion.findOne({
      where: { articleId: id, version: prevVersionNum },
    });

    if (prevVersion) {
      const prevAttachments = await Attachment.findAll({
        where: {
          articleId: id,
          articleVersionId: prevVersion.id,
        },
      });

      for (const att of prevAttachments) {
        await Attachment.create({
          articleId: id,
          articleVersionId: version.id,
          serverFilename: att.serverFilename,
          originalFilename: att.originalFilename,
          mimeType: att.mimeType,
          uploadedAt: att.uploadedAt,
        });
      }
    }

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
        await Attachment.destroy({
          where: {
            articleId: id,
            articleVersionId: version.id,
            serverFilename: filename,
          },
        });
      }
    }

    // New uploads (multer already saved in /uploads/:id)
    const files = req.files || [];
    for (const f of files) {
      await Attachment.create({
        articleId: id,
        articleVersionId: version.id,
        serverFilename: f.filename,
        originalFilename: f.originalname,
        mimeType: f.mimetype,
        uploadedAt: now,
      });
    }

    const attachments = await Attachment.findAll({
      where: { articleId: id, articleVersionId: version.id },
    });

    applyVersion(article, version, attachments);

    emit("article-updated", {
      type: "updated",
      id,
      title: article.title,
      timestamp: now.toISOString(),
    });

    res.json({
      ...serializeArticle(article),
      viewVersion: newVersion,
      latestVersion: newVersion,
      isLatest: true,
      readonly: false,
    });
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
