import { CLILoggingLevel } from 'winston';

export interface IConfig {
  dir: {
    source: string;
    build: string;
    migrations: string;
    documents: string;
    seeds: string;
  };

  env: 'production' | 'development' | 'test';
  isProduction: boolean;
  isTest: boolean;

  hostname: string;
  port: number;

  cors: any;

  db: {
    client: string;
    connection: {
      host: string;
      port: number;
      user: string;
      password: string;
      database: string;
      options?: {
        encrypt?: boolean;
      };
    };
    migrations: {
      disableTransactions: boolean;
      tableName: string;
    };
    seeds: {
      directory: string;
    }
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
