export class UserUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly changes: Record<string, unknown>,
  ) {}
}
