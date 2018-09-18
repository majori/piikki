export interface SeedData {
  users: Array<{
    username: string;
    password: string;
    defaultGroup?: string;
  }>;
  groups: Array<{
    groupName: string;
    private: boolean;
    password?: string;
  }>;
  userSaldos: Array<{
    username: string;
    groupName: string;
    saldo: number;
  }>;
  transactions: Array<{
    username: string;
    groupName: string;
    token: string;
    oldSaldo: number;
    newSaldo: number;
    timestamp: string;
  }>;
  tokens: Array<{
    token: string;
    role: string;
    comment: string;
  }>;
  tokenGroupAccess: Array<{
    groupName: string;
    token: string;
  }>;
  alternativeLogins: Array<{
    username: string;
    groupName: string;
    token: string;
    type: number;
    key: string;
  }>;
}

export interface Seed {
  data: SeedData;
  meta?: any;
}
