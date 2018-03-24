import * as _ from 'lodash';
import * as moment from 'moment';
import { badRequest } from 'boom';

export namespace validate {
  export function user(usr: UserDto): UserDto {
    if (!_.isObject(usr)) {
      throw badRequest('Invalid user object');
    }

    const passwd = password(usr.password);
    const name = username(usr.username);

    return {
      username: name,
      password: passwd,
    };
  }

  // Check if username is valid
  export function username(name: any): string {
    if (_.isUndefined(name))  { throw badRequest('No name defined'); }
    if (!_.isString(name))    { throw badRequest(`Username ${name} was not a string`); }
    if (_.isEmpty(name))      { throw badRequest('Username was empty'); }
    if (name.length < 2)      { throw badRequest('Username was shorter 2 characters'); }
    if (name.length > 20)     { throw badRequest('Username was longer than 20 characters'); }

    // Allow a-z, A-Z, 0-9, underscore and hyphen
    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      throw badRequest(
        `Username ${name} had invalid characters. ` +
        'Allowed characters are a-z, A-Z, 0-9, "-" and "_".',
      );
    }

    return name;
  }

  // Check if password is valid
  export function password(passwd: any): string {

    if (_.isUndefined(passwd))  { throw badRequest('No password defined'); }
    if (!_.isString(passwd))    { throw badRequest(`Password ${passwd} was not a string`); }
    if (_.isEmpty(passwd))      { throw badRequest('Password was empty'); }

    return passwd;
  }

  // Check if transaction amount is valid
  export function transactionAmount(amount: any): number {
    if (_.isUndefined(amount))  { throw badRequest('Amount was undefined'); }
    if (!_.isNumber(amount))    { throw badRequest(`Amount "${amount}" was not a number`); }

    return amount;
  }

  // Check if group name is valid
  export function groupName(name: any): string {
    if (_.isUndefined(name))  { throw badRequest('Group name was undefined'); }
    if (!_.isString(name))    { throw badRequest(`Group name "${name}" was not a string`); }
    if (name.length > 255)    { throw badRequest('Group name was longer than 255'); }

    return name;
  }

  export function alternativeLoginKey(key: any): any {
    if (_.isUndefined(key))  { throw badRequest('Key was undefined'); }

    return key;
  }

  export function timestamp(time: any) {
    if (_.isUndefined(time)) {
      throw badRequest(`Timestamp was undefined`);
    }

    const parsed = moment(time);
    if (!parsed.isValid()) {
      throw badRequest(`Timestamp "${time}" is invalid`);
    }

    return parsed.utc();
  }
}

export default validate;
