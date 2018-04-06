declare interface UserDto {
  username: string;
  password: string;
}

declare interface UserWithSaldo {
  username: string;
  defaultGroup: string;
  groupName: string;
  saldo: number;
}

declare interface AlternativeLoginDto {
  key: any;
  groupName: string | null;
  tokenId: number;
  type?: number;
  username?: string;
}

declare interface AlternativeLoginForUserDto {
  groupName: string;
  username: string;
  type?: number;
}
