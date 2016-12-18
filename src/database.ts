import * as _knex from 'knex';
const cfg = require('../config');

export interface IDatabaseUser {
    id: Number;
    username: String;
    password: String;
    timestamp: String;
    active: boolean;
}

export interface IDatabaseTransaction {
    id: Number;
    user_id: Number;
    group_id: Number;
    timestamp: String;
    old_saldo: Number;
    new_saldo: Number;
    comment: String;
}

export interface IDatabaseGroup {
    id: Number;
    name: String;
}

export interface IDatabaseUserSaldo {
    id: Number;
    user_id: Number;
    group_id: Number;
    saldo: Number;
}

export const knex = _knex(cfg.db);
