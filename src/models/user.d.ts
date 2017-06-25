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
  username: string;
  groupName: string;
  tokenId: number;
  key: any;
  type?: number;
}
