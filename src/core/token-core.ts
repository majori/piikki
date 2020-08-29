import * as crypto from 'crypto';
import { QueryBuilder } from 'knex';

import { knex } from '../database';
import { groupExists, getGroups } from './group-core';
import { updateTokens } from '../tokenHandler';

import { Logger } from '../logger';

const logger = new Logger(__filename);

export async function createRestrictedToken(
  groupName: string,
  comment?: string,
) {
  const group = await groupExists(groupName);
  const token = await _generateToken();

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
  const token = await _generateToken();

  await knex.from('tokens').insert({ token, role: 'global', comment });

  updateTokens(); // Inform token handler about new token
  logger.info('Global token created', { comment });

  return token;
}

export async function createAdminToken(comment?: string) {
  const token = await _generateToken(64);

  await knex.from('tokens').insert({ token, role: 'admin', comment });

  updateTokens(); // Inform token handler about new token
  logger.info('Admin token created', { comment });

  return token;
}

export async function getTokens(): Promise<DatabaseToken[]> {
  return _getTokens();
}

export async function getToken(
  comment: string,
): Promise<DatabaseToken | undefined> {
  return await _getTokens().where({ comment }).first();
}

export async function deleteToken(token: string) {
  const result = await knex
    .from('tokens')
    .where({ token })
    .update({ active: false });

  await updateTokens();
  logger.info('Token deleted', { token });

  return result;
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
    .leftJoin('token_group_access', {
      'token_group_access.token_id': 'tokens.id',
    })
    .leftJoin('groups', { 'groups.id': 'token_group_access.group_id' })
    .where({ active: true });
}

// Generates Base64 string from random bytes
async function _generateToken(length = 20) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(Math.ceil((length * 3) / 4), (err, buf) => {
      if (err) {
        reject(err);
      }

      resolve(
        buf
          .toString('base64')
          .slice(0, length)
          .replace(/\+/g, '0')
          .replace(/\//g, '0'),
      );
    });
  });
}
