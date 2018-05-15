import * as _ from 'lodash';
import * as path from 'path';
import { IConfig } from './types/config';

export const Config: IConfig = {
  dir: {
    source: path.join(__dirname, '..', 'src'),
    build: path.join(__dirname, '..', 'build'),
    migrations: path.join(__dirname, '..', 'migrations'),
    seeds: path.join(__dirname, '..', 'seeds'),
    documents: path.join(__dirname, '..', 'docs'),
  },

  // ## Environment configs
  //
  env: process.env.NODE_ENV || 'development',
  get isProduction() { return this.env === 'production'; },
  get isTest() { return this.env === 'test'; },

  // ### HTTP-server configs
  //
  hostname: process.env.PIIKKI_HTTP_HOSTNAME || 'localhost',
  port: process.env.PIIKKI_HTTP_PORT || process.env.port || 4000,
  cors: {},

  // ### Database configs
  //
  db: {
    client: process.env.PIIKKI_DATABASE_CLIENT || 'pg',
    connection: {
      host: process.env.PIIKKI_DATABASE_HOSTNAME,
      user: process.env.PIIKKI_DATABASE_USER,
      password: process.env.PIIKKI_DATABASE_PASSWORD,
      database: process.env.PIIKKI_DATABASE_NAME,
      port: parseInt(process.env.PIIKKI_DATABASE_PORT, 10) || 5432,
    },
    migrations: {
      disableTransactions: true,
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds/development',
    },
  },

  // ### Logger options
  //
  logLevel: process.env.LOG_LEVEL || 'info',

  // ### Swagger documentation
  //
  swagger: {
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
  },
};

export default Config;