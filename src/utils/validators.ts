import * as _ from 'lodash';
import * as moment from 'moment';
import { badRequest } from 'boom';
import * as Joi from 'joi';

namespace schemas {
  export const username = Joi.string().token().empty().min(2).max(20).label('Username');
  export const password = Joi.string().empty().min(1).label('Password');
  export const user = Joi.object().keys({ username, password }).label('User');
  export const transactionAmount = Joi.number().precision(2).label('Transaction amount');
  export const groupName = Joi.string().min(4).max(255).label('Group name');
  export const alternativeLoginKey = Joi.string().empty().label('Alternative login key');
  export const timestamp = Joi.date().label('Timestamp');
}

export namespace validate {
  function validateSchema<T>(schema: Joi.Schema, value: T): T {
    const result = schema.validate(value);

    if (result.error) {
      throw badRequest(result.error.message, result.error.details);
    }

    return result.value;
  }

  export const user = _.partial(validateSchema, schemas.user);
  export const username = _.partial(validateSchema, schemas.username);
  export const password = _.partial(validateSchema, schemas.password);
  export const transactionAmount = _.partial(validateSchema, schemas.transactionAmount);
  export const groupName = _.partial(validateSchema, schemas.groupName);
  export const alternativeLoginKey = _.partial(validateSchema, schemas.alternativeLoginKey);
  export const timestamp = (time: any): moment.Moment => moment(validateSchema(schemas.timestamp, time)).utc();
}

export default validate;
