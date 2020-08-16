import * as _ from 'lodash';
import type * as Knex from 'knex';
import * as path from 'path';
import { CLILoggingLevel } from 'winston';

const defaultDbConfig: Knex.Config = {
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING || {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    extension: 'ts',
  },
};

export const dir = {
  source: path.join(__dirname, '..', 'src'),
  build: path.join(__dirname, '..', 'build'),
  migrations: path.join(__dirname, 'migrations'),
  seeds: path.join(__dirname, '..', 'seeds'),
  documents: path.join(__dirname, '..', 'docs'),
};

// ### Environment configs
//
export const env = process.env.NODE_ENV || 'development';

export const isProduction = env === 'production';
export const isTest = env === 'test';

// ### HTTP-server configs
//
export const hostname = process.env.PIIKKI_HOSTNAME || '0.0.0.0';
export const port =
  parseInt(process.env.PORT! || process.env.port!, 10) || 4000;
export const cors = {};

// ### Database configs
//
export const db = {
  production: {
    ...defaultDbConfig,
    migrations: {
      extension: 'js',
    },
  },

  development: {
    ...defaultDbConfig,
    connection: process.env.PG_CONNECTION_STRING || {
      host: 'localhost',
      port: 6001,
      database: 'postgres',
      user: 'postgres',
      password: 'password12!',
    },
    seeds: {
      directory: './seeds/development',
    },
  },

  test: {
    ...defaultDbConfig,
  },
};

// ### Logger options
//
export const logLevel = (process.env.LOG_LEVEL as CLILoggingLevel) || 'info';

// ### Swagger documentation
//
export const swagger = {
  swaggerDefinition: {
    info: {
      title: 'Piikki',
      version: require('../package.json').version,
      description: 'API definition for Piikki API',
    },
    basePath: '/api/v1/',
    schemes: ['https', 'http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    security: [{ token: [] }],
    securityDefinitions: {
      token: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
      },
    },
  },
  apis: ['./src/router.ts'],
};
