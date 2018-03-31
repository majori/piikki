import { QueryBuilder } from 'knex';
import * as _ from 'lodash';

import { badRequest, notFound } from 'boom';
import * as userCore from './user-core';
import { createRestrictedToken } from './token-core';
import { knex } from '../database';
import { Logger } from '../logger';

const logger = new Logger(__filename);

export async function createGroup(groupName: string) {
  const records: DatabaseGroup[] = await knex.from('groups').where({ name: groupName });

  if (!_.isEmpty(records)) {
    throw badRequest(`Group ${groupName} already exists`);
  }

  await knex.from('groups').insert({ name: groupName });
  await createRestrictedToken(groupName, `Created for new group ${groupName}`);

  logger.info('Group created', { group_name: groupName });

  return groupName;
}

export async function groupExists(groupName: string) {
  const row: DatabaseGroup = await knex('groups').where({ name: groupName }).first();

  if (row) {
    return row;
  } else {
    throw notFound(`Group ${groupName} not found`);
  }
}

export async function userIsNotInGroup(username: string, groupName: string) {
  const result = await _userInGroup(username, groupName);

  if (!result.found) {
    return { user: result.user, group: result.group };
  } else {
    throw badRequest(`User ${result.user.username} is already in group ${result.group.name}`);
  }
}

export async function userIsInGroup(username: string, groupName: string) {
  const result = await _userInGroup(username, groupName);

  if (result.found) {
    return {
      user: result.user,
      group: result.group,
    };
  } else {
    throw notFound(`User ${result.user.username} is not in group ${result.group.name}`);
  }
}

export function getUsersFromGroup(groupName: string): QueryBuilder {
  return knex
    .select('users.username', 'user_saldos.saldo')
    .from('users')
    .join('user_saldos', { 'user_saldos.user_id': 'users.id' })
    .join('groups', { 'groups.id': 'user_saldos.group_id' })
    .where({ 'groups.name': groupName });
}

export async function getUserFromGroup(groupName: string, username: string) {
  const row: DatabaseUser = await getUsersFromGroup(groupName)
    .andWhere({ 'users.username': username })
    .first();

  if (!_.isEmpty(row)) {
    return row;
  } else {
    throw notFound(`User ${username} is not in group ${groupName}`);
  }
}

export function getGroups(): QueryBuilder {
  return knex
    .from('groups')
    .select('name');
}

export function getGroup(groupName: string): QueryBuilder {
  return getGroups()
    .where({ name: groupName })
    .first();
}

export async function addUserToGroup(username: string, groupName: string) {
  const result = await userIsNotInGroup(username, groupName);

  await knex
    .from('user_saldos')
    .insert({
      group_id: result.group.id,
      user_id: result.user.id,
    });

  // If the user isn't in other groups, set the group as user's default
  const saldos = await knex
    .select('users.username')
    .from('user_saldos')
    .where({
      user_id: result.user.id,
    })
    .join('users', { 'users.id': 'user_saldos.user_id' });

  if (_.size(saldos) === 1) {
    await userCore.setDefaultGroup(saldos[0].username, groupName);
  }

  return username;
}

export async function removeUserFromGroup(username: string, groupName: string) {
  const result = await userIsInGroup(username, groupName);
  await knex
    .from('user_saldos')
    .where({
      user_id: result.user.id,
      group_id: result.group.id,
    })
    .del();

  // Check if the group was users default group
  const user = await userCore.getUser(username);
  if (user.defaultGroup === groupName) {
    await userCore.resetDefaultGroup(username);
  }

  return username;
}

async function _userInGroup(username: string, groupName: string) {
  const user = await userCore.userExists(username);
  const group = await groupExists(groupName);

  const row = await knex
    .from('user_saldos')
    .where({ user_id: user.id, group_id: group.id })
    .first();

  return {
    found: !_.isUndefined(row),
    user,
    group,
  };
}
