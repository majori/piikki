export interface ITransactionDto {
  username: string;
  groupName: string;
  amount: number;
  tokenId: number;
  comment?: string;
}

export interface ITransactionFilter {
  'users.username'?: string;
  'groups.name'?: string;
}
