import Joi from 'joi'

export const createSchema = Joi.object({
  name: Joi.string().min(1).required(),
  label: Joi.string().min(1).required(),
});

export const updateSchema = Joi.object({
  name: Joi.string().min(1).required(),
  label: Joi.string().min(1).required(),
});
