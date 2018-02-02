import * as _ from 'lodash';
import * as moment from 'moment';
import { RequestHandler } from 'express';
import { EndpointFunction } from 'types/endpoints';

import { ValidationError } from '../errors';
import { Logger } from '../logger';

const logger = new Logger(__filename);

// Wraps the result to json response if succesful
// else pass error to express error handler
export function createJsonRoute(func: EndpointFunction): RequestHandler {
  return async (req, res, next) => {
    try {
      const result = await func(req);
      const response = { ok: true, result: result || {} };

      // Set status to OK
      res.status(200);

      // Track a succesful request
      logger.request(req, res);

      // Send the response
      res.json(response);

    // Pass error to error handler
    } catch (err) {
      next(err);
    }
  };
}

// Check if username and password is valid
export function validateUser(user: UserDto): UserDto {
  if (!_.isObject(user)) {
    throw new ValidationError('Invalid user object');
  }

  const password = validatePassword(user.password);
  const username = validateUsername(user.username);

  return {
    username,
    password,
  };
}

// Check if username is valid
export function validateUsername(username: any): string {
  // Allow a-z, A-Z, 0-9, underscore and hyphen
  const regEx = /^[a-zA-Z0-9-_]+$/;

  if (_.isUndefined(username))  { throw new ValidationError('No username defined'); }
  if (!_.isString(username))    { throw new ValidationError(`Username ${username} was not a string`); }
  if (_.isEmpty(username))      { throw new ValidationError('Username was empty'); }
  if (username.length < 2)      { throw new ValidationError('Username was shorter 2 characters'); }
  if (username.length > 20)     { throw new ValidationError('Username was longer than 20 characters'); }
  if (!regEx.test(username)) {
    throw new ValidationError(
      `Username ${username} had invalid characters. ` +
      'Allowed characters are a-z, A-Z, 0-9, "-" and "_".',
    );
  }

  return username;
}

// Check if password is valid
export function validatePassword(password: any): string {

  if (_.isUndefined(password))  { throw new ValidationError('No password defined'); }
  if (!_.isString(password))    { throw new ValidationError(`Password ${password} was not a string`); }
  if (_.isEmpty(password))      { throw new ValidationError('Password was empty'); }

  return password;
}

// Check if transaction amount is valid
export function validateTransactionAmount(amount: any): number {
  if (_.isUndefined(amount))  { throw new ValidationError('Amount was undefined'); }
  if (!_.isNumber(amount))    { throw new ValidationError(`Amount "${amount}" was not a number`); }

  return amount;
}

// Check if group name is valid
export function validateGroupName(name: any): string {
  if (_.isUndefined(name))  { throw new ValidationError('Group name was undefined'); }
  if (!_.isString(name))    { throw new ValidationError(`Group name "${name}" was not a string`); }
  if (name.length > 255)    { throw new ValidationError('Group name was longer than 255'); }

  return name;
}

export function validateAlternativeLoginKey(key: any): any {
  if (_.isUndefined(key))  { throw new ValidationError('Key was undefined'); }

  return key;
}

export function validateTimestamp(timestamp: any) {
  if (_.isUndefined(timestamp)) {
    throw new ValidationError(`Timestamp was undefined`);
  }

  const parsed = moment(timestamp);
  if (!parsed.isValid()) {
    throw new ValidationError(`Timestamp "${timestamp}" is invalid`);
  }

  return parsed.utc();
}
