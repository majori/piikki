import * as _knex from 'knex';
const cfg = require('../config');

export const knex = _knex(cfg.db);
