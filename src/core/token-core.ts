import * as crypto from 'crypto';
import { QueryBuilder } from 'knex';

import { knex } from '../database';
import { groupExists, getGroups } from './group-core';
import { updateTokens } from '../tokenHandler';

import { Logger } from '../logger';

const logger = new Logger(__filename);

export async function createRestrictedToken(groupName: string, comment?: string) {

  const group = await groupExists(groupName);
  const token = await _generateBase64Token();

  const id = await knex
    .from('tokens')
    .insert({ token, role: 'restricted', comment })
    .returning('id');

  await knex
    .from('token_group_access')
    .insert({ token_id: id[0], group_id: group.id });

  updateTokens(); // Inform token handler about new token
  logger.info('Restricted token created', { groupName, comment });

  return token;
}

export async function createGlobalToken(comment?: string) {
  const token = await _generateBase64Token();

  await knex
    .from('tokens')
    .insert({ token, role: 'global', comment });

  updateTokens(); // Inform token handler about new token
  logger.info('Global token created', { comment });

  return token;
}

export async function createAdminToken(comment?: string) {
  const token = await _generateBase64Token(64);

  await knex
    .from('tokens')
    .insert({ token, role: 'admin', comment });

  updateTokens(); // Inform token handler about new token
  logger.info('Admin token created', { comment });

  return token;
}

export async function getTokens(): Promise<DatabaseToken[]> {
  return _getTokens();
}

export async function getToken(comment: string): Promise<DatabaseToken | undefined> {
  return await _getTokens()
    .where({ comment })
    .first();
}

export async function deleteToken(token: string) {
  const result = await knex
    .from('tokens')
    .where({ token })
    .del();

  logger.info('Token deleted', { token });

  return result;
}

// Creates one global token and restricted token for every group
export async function initializeTokens() {
  const token = await createGlobalToken();
  const groups = await getGroups();

  for (const group of groups) {
    await createRestrictedToken(group.name);
  }

  return await getTokens;
}

function _getTokens(): QueryBuilder {
  return knex
    .select(
      'tokens.id',
      'tokens.token',
      'tokens.role',
      'groups.name AS group_name',
      'tokens.comment',
    )
    .from('tokens')
    .leftJoin('token_group_access', { 'token_group_access.token_id': 'tokens.id' })
    .leftJoin('groups', { 'groups.id': 'token_group_access.group_id' });
}

// Generates Base64 string from random bytes
async function _generateBase64Token(length = 32) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buf) => {
      if (err) { reject(err); }

      resolve(buf.toString('base64'));
    });
  });
}
