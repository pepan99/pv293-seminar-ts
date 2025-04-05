export type CommandSucceededWithId = Promise<{
  id: string;
}>;

export type CommandSucceededWithBool = Promise<{
  success: boolean;
}>;
