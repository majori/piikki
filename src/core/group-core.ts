import { QueryBuilder } from 'knex';
import * as _ from 'lodash';
import * as appInsights from 'applicationinsights';

import { ConflictError, NotFoundError } from '../errors';
import { userExists } from './user-core';
import { createRestrictedToken } from './token-core';
import { knex } from '../database';

import { IDatabaseGroup, IDatabaseUser, IDatabaseUserSaldo  } from '../models/database';

export async function createGroup(groupName: string) {
  const records: IDatabaseGroup[] = await knex.from('groups').where({ name: groupName });

  if (!_.isEmpty(records)) {
    throw new ConflictError(`Group ${groupName} already exists`);
  }

  await knex.from('groups').insert({ name: groupName });
  await createRestrictedToken(groupName, `Created for new group ${groupName}`);

  if (appInsights.client) {
    appInsights.client.trackEvent('Group create', { groupName });
  }
  return groupName;
}

export async function groupExists(groupName: string) {
  const row: IDatabaseGroup = await knex('groups').where({ name: groupName }).first();

  if (row) {
    return row;
  } else {
    throw new NotFoundError(`Group ${groupName} not found`);
  }
}

export async function userIsNotInGroup(username: string, groupName: string) {
  const result = await _userInGroup(username, groupName);

  if (!result.found) {
    return { user: result.user, group: result.group };
  } else {
    throw new ConflictError(`User ${result.user.username} is already in group ${result.group.name}`);
  }
}

export async function userIsInGroup(username: string, groupName: string) {
  const result = await _userInGroup(username, groupName);

  if (result.found) {
    return { user: result.user, group: result.group };
  } else {
    throw new NotFoundError(`User ${result.user.username} is not in group ${result.group.name}`);
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
  const row: IDatabaseUser = await getUsersFromGroup(groupName)
    .andWhere({ 'users.username': username })
    .first();

  if (!_.isEmpty(row)) {
    return row;
  } else {
    throw new NotFoundError(`User ${username} is not in group ${groupName}`);
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
    .insert({ group_id: result.group.id, user_id: result.user.id });

  return username;
}

export async function removeUserFromGroup(username: string, groupName: string) {
  const result = await userIsInGroup(username, groupName);
  await knex
    .from('user_saldos')
    .where({ user_id: result.user.id, group_id: result.group.id })
    .del();

  return username;
}

async function _userInGroup(username: string, groupName: string) {
  const user = await userExists(username);
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
