import Joi from 'joi'

export const createSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).required(),
  workspaceId: Joi.number().integer().required(),
})

export const updateSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  content: Joi.string().min(1),
  workspaceId: Joi.number().integer(),
  deleted: Joi.string(),
})
