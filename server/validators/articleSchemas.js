import Joi from 'joi'

export const createSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).required(),
})

export const updateSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  content: Joi.string().min(1),
}).or('title', 'content')
