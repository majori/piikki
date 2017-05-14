import * as _knex from 'knex';
const cfg: any = require('../config'); // tslint:disable-line

export const knex = _knex(cfg.db);
