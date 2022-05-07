import type { CLILoggingLevel } from 'winston';
import type { Knex } from 'knex';

export interface IConfig {
  dir: {
    source: string;
    build: string;
    migrations: string;
    documents: string;
    seeds: string;
  };

  env: string;
  isProduction: boolean;
  isTest: boolean;

  hostname: string;
  port: number;

  cors: any;

  db: {
    production: Knex.Config;
    development: Knex.Config;
  };

  logLevel: CLILoggingLevel;
}
