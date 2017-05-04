import * as _knex from 'knex';
const cfg = require('../config');

export interface IDatabaseUser {
  id: number;
  username: string;
  password: string;
  timestamp: string;
  active: boolean;
}

export interface IDatabaseTransaction {
  id: number;
  user_id: number;
  group_id: number;
  timestamp: string;
  old_saldo: number;
  new_saldo: number;
  comment: string;
}

export interface IDatabaseGroup {
  id: number;
  name: string;
}

export interface IDatabaseUserSaldo {
  id: number;
  user_id: number;
  group_id: number;
  saldo: number;
}

export interface IDatabaseToken {
  id: number;
  token: string;
  role: 'restricted' | 'global' | 'admin';
  group_name: string;
  comment?: string;
}

export const knex = _knex(cfg.db);
