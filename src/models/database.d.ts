export type DatabaseUser = {
  id: number;
  username: string;
  password: string;
  timestamp: string;
  active: boolean;
}

export type DatabaseTransaction = {
  id?: number;
  user_id: number;
  group_id: number;
  timestamp: string;
  old_saldo: number;
  new_saldo: number;
  comment: string | null;
}

export type DatabaseGroup = {
  id: number;
  name: string;
}

export type DatabaseUserSaldo = {
  id: number;
  user_id: number;
  group_id: number;
  saldo: number;
}

export interface IDatabaseToken {
  id: number;
  token: string;
  role: 'restricted' | 'global' | 'admin';
  group_name: string;
  comment?: string;
}

export interface IDatabaseAlternativeLogin {
  username: string;
  group_name: string;
  type: number | null;
  hashed_key: string;
}
