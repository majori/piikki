import type { CLILoggingLevel } from 'winston';
import type * as Knex from 'knex';

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
    test: Knex.Config;
  };

  logLevel: CLILoggingLevel;

  swagger: {
    swaggerDefinition: {
      info: {
        title: string;
        version: string;
        description: string;
      };
      basePath: string;
      schemes: string[];
      consumes: string[];
      produces: string[];
      security: any[];
      securityDefinitions: any;
    };
    apis: string[];
  };
}
