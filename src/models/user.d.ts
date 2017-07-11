export type UserDto = {
  username: string;
  password: string;
}

export type UserWithSaldo = {
  username: string;
  groupName: string;
  saldo: number;
}

export type AlternativeLoginDto = {
  key: any;
  groupName: string;
  tokenId: number;
  type?: number;
  username?: string;
}

export type AlternativeLoginForUserDto = {
  groupName: string;
  username: string;
  type?: number;
}

