import * as crypto from 'crypto';
import * as _ from 'lodash';
import * as Debug from 'debug';

import { knex } from '../database';
import { groupExists, getGroups } from './group-core';
import { updateTokens } from '../tokenHandler';

import { QueryBuilder } from 'knex';
import { IDatabaseGroup } from '../models/database';

const debug = Debug('piikki:token-core');

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

  debug('Created restricted token', token);
  updateTokens(); // Inform token handler about new token

  return token;
}

export async function createGlobalToken(comment?: string) {
  const token = await _generateBase64Token();

  await knex
    .from('tokens')
    .insert({ token, role: 'global', comment });

  debug('Created global token', token);
  updateTokens(); // Inform token handler about new token

  return token;
}

export async function createAdminToken(comment?: string) {
  const token = _generateBase64Token(64);

  await knex
    .from('tokens')
    .insert({ token, role: 'admin', comment });

  debug('Created admin token', token);
  updateTokens(); // Inform token handler about new token
  return token;
}

export async function getTokens() {
  return await _getTokens();
}

export async function getToken(groupName: string) {
  return await _getTokens()
    .where({ 'groups.name': groupName })
    .first();
}

export async function deleteToken(token: string) {
  return await knex
    .from('tokens')
    .where({ token })
    .del();
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
    'tokens.comment')
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
