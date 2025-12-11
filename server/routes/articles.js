import { Router } from 'express'
import { uploadMany } from '../middleware/uploads.js'
import {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articles.js'
import { createComment } from '../controllers/comments.js'

const router = Router()

router.get('/', listArticles)
router.get('/:id', getArticle)
router.post('/', uploadMany, createArticle)
router.put('/:id', uploadMany, updateArticle)
router.delete('/:id', deleteArticle)

router.post('/:id/comments', createComment)

export default router
