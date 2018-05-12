import * as _knex from 'knex';
import cfg from '../config';

export const knex = _knex(cfg.db);
