import { knex as _knex } from 'knex';
import * as cfg from './config';

export const knex = _knex(
  cfg.isProduction ? cfg.db.production : cfg.db.development,
);
