import db from "../database/models/index.js";
import { createSchema, updateSchema } from '../validators/commentSchemas.js'

const { Comment, Article } = db;

export async function createComment(req, res, next) {
  try {
    const articleId = Number(req.params.id);
    if (!Number.isFinite(articleId)) {
      return next({ status: 400, message: "Invalid article id" });
    }

    const article = await Article.findByPk(articleId);
    if (!article) {
      return next({ status: 404, message: "Article not found" });
    }

    const { error, value } = createSchema.validate(req.body);
    if (error) {
      return next({ status: 400, message: error.message });
    }

    const comment = await Comment.create({
      articleId,
      author: value.author || null,
      content: value.content,
    });

    res.status(201).json(comment);
  } catch (e) {
    next(e);
  }
}

export async function updateComment(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return next({ status: 400, message: "Invalid comment id" });
    }

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return next({ status: 400, message: error.message });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return next({ status: 404, message: "Comment not found" });
    }

    await comment.update(value);
    res.json(comment);
  } catch (e) {
    next(e);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return next({ status: 400, message: "Invalid comment id" });
    }

    const deleted = await Comment.destroy({ where: { id } });
    if (!deleted) {
      return next({ status: 404, message: "Comment not found" });
    }

    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
