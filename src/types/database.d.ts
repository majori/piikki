declare interface DatabaseUser {
  id: number;
  username: string;
  password: string;
  timestamp: string;
  active: boolean;
  default_group: number | null;
}

declare interface DatabaseTransaction {
  id?: number;
  user_id: number;
  group_id: number;
  timestamp: string;
  old_saldo: number;
  new_saldo: number;
  comment: string | null;
}

declare interface DatabaseGroup {
  id: number;
  name: string;
}

declare interface DatabaseUserSaldo {
  id: number;
  user_id: number;
  group_id: number;
  saldo: number;
}

declare interface DatabaseToken {
  id: number;
  token: string;
  role: 'restricted' | 'global' | 'admin';
  group_name: string;
  comment?: string;
}

declare interface DatabaseAlternativeLogin {
  username: string;
  group_name: string;
  type: number | null;
  hashed_key: string;
}
