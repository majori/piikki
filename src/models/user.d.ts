export interface IUserDto {
  username: string;
  password: string;
}

export interface IUserWithSaldo {
  username: string;
  groupName: string;
  saldo: number;
}

export interface IUserAlternativeLoginDto {
  key: any;
  groupName: string;
  tokenId: number;
  type?: number;
  username?: string;
}
