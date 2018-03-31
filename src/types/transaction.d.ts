declare interface TransactionDto {
  username: string;
  groupName: string;
  amount: number;
  tokenId: number;
  comment?: string;
  timestamp?: string;
}

declare interface TransactionFilter {
  'users.username'?: string;
  'groups.name'?: string;
}
