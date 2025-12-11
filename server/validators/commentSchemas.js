import Joi from 'joi'

export const createSchema = Joi.object({
  author: Joi.string().allow("", null),
  content: Joi.string().min(1).required(),
});

export const updateSchema = Joi.object({
  author: Joi.string().allow("", null),
  content: Joi.string().min(1),
});
