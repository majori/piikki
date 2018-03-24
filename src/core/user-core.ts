import * as bcrypt from 'bcrypt';
import { QueryBuilder } from 'knex';
import * as _ from 'lodash';
import * as crypto from 'crypto';
import { badRequest, notFound } from 'boom';

import { knex} from '../database';
import { groupExists, userIsInGroup } from './group-core';

import { Logger } from '../logger';

const logger = new Logger(__filename);

export const SALT_ROUNDS = 6;

// Get all users in group
export async function getUsers() {
  const results: UserWithSaldo[] = await _getUsersWithSaldos();

  return _.chain(results)
    .groupBy((user) => user.username)
    .map((users: UserWithSaldo[], key: string) => _.reduce(users, (user: any, value: UserWithSaldo) => {
      if (value.groupName) {
        user.saldos[value.groupName] = value.saldo;
      }
      if (value.defaultGroup && !user.defaultGroup) {
        user.defaultGroup = value.defaultGroup;
      }
      return user;
    },
      {
        username: key,
        defaultGroup: null,
        saldos: {},
      }),
    )
    .value();
}

// Get user info and saldo in each group
export async function getUser(username: string) {
  const rawUser = await userExists(username);
  const user = {
    username: rawUser.username,
    defaultGroup: null,
    saldos: {},
  };

  // Fetch possible saldos in groups
  const results = await _getUsersWithSaldos().andWhere({ 'usr.username': username });
  // There was no saldos, return only user info
  if (_.isEmpty(results)) { return user; }

  // Parse database rows to saldos object
  return _.reduce(results, (result: any, value: any) => {
    if (value.groupName) {
      result.saldos[value.groupName] = value.saldo;
    }
    if (value.defaultGroup && !result.defaultGroup) {
      result.defaultGroup = value.defaultGroup;
    }
    return result;
  }, user);
}

// Create new user
export async function createUser(user: UserDto) {
  const results = await knex.from('users').where({ username: user.username });

  if (!_.isEmpty(results)) {
    throw badRequest(`Username ${user.username} already exists`);
  }

  const hash = await _hashPassword(user.password);
  await knex.from('users').insert({
    username: user.username,
    password: hash,
  });

  logger.info('User created', { username: user.username });

  return user.username;
}

// Puts user's "active" -status to false
export async function deleteUser(username: string) {
  await knex.from('users').where({ username }).update({ active: false });
  logger.info('User deleted', { username });
  return;
}

// Compare raw password with the hashed one
export async function authenticateUser(user: UserDto) {
  try {
    const row = await userExists(user.username);
    return await bcrypt.compare(user.password, row.password);
  } catch (err) {
    // If user was not found, just response with failed authentication
    if (err.isBoom && err.typeof(notFound)) {
      return false;

    // Some other error occured, pass the exception
    } else {
      throw err;
    }
  }
}

// Checks if user is in database
export async function userExists(username?: string) {
  if (_.isUndefined(username)) {
    throw badRequest('Username was undefined');
  }
  const row: DatabaseUser = await knex.from('users').where({ username, active: true }).first();

  if (row) {
    return row;
  } else {
    throw notFound(`User ${username} not found`);
  }
}

export async function userNotExists(username: string) {
  try {
    await userExists(username);
    throw badRequest(`User ${username} already exists`);
  } catch (err) {
    if (err.isBoom && err.typeof(notFound)) {
      return true;
    } else {
      throw err;
    }
  }
}

// Resets user's password
// Does require old password
export async function resetPassword(user: UserDto, newPassword: string) {
  const isSame = await authenticateUser(user);

  if (!isSame) {
    throw badRequest('Old password did not match');
  }

  const hash = await _hashPassword(newPassword);

  await knex
    .from('users')
    .where({ username: user.username })
    .update({ password: hash });

  return;
}

// This function doesn't require old password.
// Currently only admin can use
export async function forceResetPassword(username: string, password: string) {
  await userExists(username);
  const hash = await _hashPassword(password);
  await knex
    .from('users')
    .where({ username })
    .update({ password: hash });

  return;
}

// Reset user's username
export async function resetUsername(oldUsername: string, newUsername: string) {
  await userExists(oldUsername); // Check if old user exists
  await userNotExists(newUsername); // Check if new username doesn't exists
  await knex
    .from('users')
    .where({ username: oldUsername })
    .update({ username: newUsername });

  return { username: newUsername };
}

export async function getAlternativeLogin(login: AlternativeLoginDto): Promise<DatabaseAlternativeLogin> {
  const hash = _hashString(login.key);

  const query = knex
    .select(
      'users.username',
      'groups.name as group_name',
      'alternative_login.hashed_key',
      'alternative_login.type',
    )
    .from('alternative_login')
    .join('users', { 'alternative_login.user_id': 'users.id' })
    .join('groups', { 'alternative_login.group_id': 'groups.id' })
    .join('tokens', { 'alternative_login.token_id': 'tokens.id' })
    .where({ 'groups.name': login.groupName })
    .where({ 'alternative_login.hashed_key': hash })
    .where({ 'alternative_login.type': login.type || null });

  if (login.username) {
    query.where({ 'users.username': login.username });
  }

  return await query.first();
}

export async function getAlternativeLoginsForUser(login: AlternativeLoginForUserDto): Promise<QueryBuilder> {
  const query = knex('alternative_login as login')
    .join('users', { 'users.id': 'login.user_id'})
    .join('groups', { 'groups.id': 'login.group_id'})
    .where({ 'groups.name': login.groupName })
    .andWhere({ 'users.username': login.username });

  if (login.type) {
    query.andWhere({ 'login.type': login.type });
  }

  return query;
}

export async function createAlternativeLogin(login: AlternativeLoginDto) {
  const hash = _hashString(_.toString(login.key));
  const user = await userExists(login.username);
  const group = await groupExists(login.groupName);

  return knex('alternative_login')
    .insert({
      user_id: user.id,
      group_id: group.id,
      token_id: login.tokenId,
      type: login.type || null,
      hashed_key: hash,
    });
}

export async function setDefaultGroup(username: string, groupName: string) {
  const result = await userIsInGroup(username, groupName);
  await knex
    .from('users')
    .where({ id: result.user.id })
    .update({ default_group: result.group.id });
}

export async function resetDefaultGroup(username: string) {
  await knex
    .from('users')
    .where({ username })
    .update({ default_group: null });
}

// Get all users in group
function _getUsersWithSaldos(): QueryBuilder {
  return knex.with('usr', (qb) => {
      qb
        .select('users.id', 'users.username', 'users.active', 'groups.name AS defaultGroup')
        .from('users')
        .leftJoin('groups', { 'groups.id': 'users.default_group' });
    })
    .select('usr.username', 'usr.defaultGroup', 'groups.name AS groupName', 'user_saldos.saldo')
    .from('usr')
    .leftJoin('user_saldos', { 'user_saldos.user_id': 'usr.id' })
    .leftJoin('groups', { 'groups.id': 'user_saldos.group_id' })
    .orderBy('usr.username')
    .where({ 'usr.active': true });
}

// Hash passwords
async function _hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Hash non-passwords
function _hashString(str: string) {
  return crypto.createHash('sha256').update(str).digest('hex');
}
