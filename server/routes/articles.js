import { Router } from 'express'
import { uploadMany } from '../middleware/uploads.js'
import {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  listArticleVersions,
  getArticleVersion,
  exportArticlePdf,
} from '../controllers/articles.js'
import { createComment } from '../controllers/comments.js'

const router = Router()

router.get('/', listArticles)
router.get('/:id', getArticle)
router.get('/:id/versions', listArticleVersions)
router.get('/:id/versions/:version', getArticleVersion)

router.post('/', uploadMany, createArticle)
router.put('/:id', uploadMany, updateArticle)
router.delete('/:id', deleteArticle)

router.post('/:id/comments', createComment)

router.get('/:id/export/pdf', exportArticlePdf);

export default router
