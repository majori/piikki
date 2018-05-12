import * as _ from 'lodash';
import * as moment from 'moment';
import { badRequest } from 'boom';
import * as Joi from 'joi';

namespace schemas {
  export const username = Joi.string()
    .token()
    .regex(/^\d+$/, { invert: true }) // Can't be a number
    .label('Username');

  export const password = Joi.string()
    .label('Password');

  // Used when creating a new user
  export const user = Joi.object()
    .keys({
      username: username.required().min(2).max(20),
      password: password.required().min(4).max(255),
    })
    .options({ stripUnknown: true })
    .label('User');

  export const transactionAmount = Joi.number()
    .precision(2)
    .min(-1e+6)
    .max(1e+6)
    .label('Transaction amount');

  export const groupName = Joi.string()
    .token()
    .regex(/^\d+$/, { invert: true }) // Can't be a number
    .min(4)
    .max(30)
    .label('Group name');

  export const alternativeLoginKey = Joi.string()
    .empty()
    .label('Alternative login key');

  export const timestamp = Joi.date()
    .label('Timestamp');

  // Used for user authorization. Keep validation loose
  // since new user's username and password validation can change
  export const auth = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }).options({ stripUnknown: true });

  export const id = Joi.number().integer().positive();

  export const bool = Joi.boolean().default(false);
}

function validateSchema<T>(schema: Joi.Schema, value: T): T {
  const result = schema.validate(value);
  if (result.error) {
    throw badRequest(result.error.message, result.error.details);
  }
  return result.value;
}

type Validator<T> = (value: T | undefined | null) => T;

export default {
  user: _.partial(validateSchema, schemas.user) as Validator<UserDto>,
  auth: _.partial(validateSchema, schemas.auth) as Validator<UserDto>,
  username: _.partial(validateSchema, schemas.username) as Validator<string>,
  password: _.partial(validateSchema, schemas.password) as Validator<string>,
  transactionAmount: _.partial(validateSchema, schemas.transactionAmount) as Validator<number>,
  groupName: _.partial(validateSchema, schemas.groupName) as Validator<string>,
  alternativeLoginKey: _.partial(validateSchema, schemas.alternativeLoginKey) as Validator<string>,
  timestamp: (time: any): moment.Moment => moment(validateSchema(schemas.timestamp, time)).utc(),
  bool: _.partial(validateSchema, schemas.bool) as Validator<boolean>,
  id: _.partial(validateSchema, schemas.id) as Validator<number>,
};
