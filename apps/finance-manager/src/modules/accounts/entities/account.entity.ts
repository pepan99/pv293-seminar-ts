export type Account = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  deletedAt: Date | null;
};

export type RequestAccountEntity = {
  accountId: string;
};
