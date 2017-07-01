export type TransactionDto = {
  username: string;
  groupName: string;
  amount: number;
  tokenId: number;
  comment?: string;
}

export type TransactionFilter = {
  'users.username'?: string;
  'groups.name'?: string;
}
