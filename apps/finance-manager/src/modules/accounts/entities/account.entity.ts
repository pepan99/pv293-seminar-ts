export type Account = {
  id: string;
  userId: string;
  createdAt: Date;
  deletedAt: Date | null;
};

export type RequestAccountEntity = {
  accountId: string;
};
