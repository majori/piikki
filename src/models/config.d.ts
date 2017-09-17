export type Config = {
  dir: {
    source: string;
    build: string;
    migrations: string;
    library: string;
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
      server: string;
      user: string;
      password: string;
      options: {
        port: number;
        database: string;
        encrypt: boolean;
      };
    };
    migrations: {
      disableTransactions: boolean;
      tableName: string;
    };
    seeds: {
      directory: string;
    }
  }
}
