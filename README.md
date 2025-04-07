# Seminar 8: Implementing CQRS and Event-Driven Architecture

In this seminar, you will refactor the `Accounts` module to use Command Query Responsibility Segregation (CQRS) and
Event-Driven Architecture (EDA) patterns. The module already follows Clean Architecture principles with its directory
structure (`api`, `application`, `core`, `infrastructure`), but we'll improve the interaction patterns within these
layers using CQRS and EDA.

## Background

Currently, the `Accounts` module follows Clean Architecture with direct use case injection (procedural calling). While
the structure is good, the interaction patterns could be improved. Your task is to refactor it to use CQRS, which
separates read and write operations, and EDA, which uses events for communication between components, while maintaining
the existing Clean Architecture layers.

## Instructions

### 1. Understand the Current Architecture

First, explore the `Accounts` module structure and understand how it works:

- Examine how Clean Architecture is already implemented with separated layers:
    - `api`: Controllers and DTOs (presentation layer)
    - `application`: Use cases (application layer)
    - `core`: Entities and domain objects (domain layer)
    - `infrastructure`: Repositories and DB access (infrastructure layer)
- Note how controllers directly depend on use cases through injection
- Look at the `Users` module which implements both Clean Architecture and CQRS/EDA for reference

### 2. Implement Commands and Queries

#### A. Create Command Handlers

1. Create a `commands` directory inside `application` if it doesn't exist
2. In the next seminar we will be using `AggregateRoot`, for now have the business logic inside of commands.
3. Implement the following command handlers:
    - `CreateAccountCommandHandler`
    - `UpdateAccountCommandHandler`
    - `RemoveAccountCommandHandler`

Don't forget to:

- Use the `@CommandHandler()` decorator
- Emit appropriate events after operations complete

Example structure:

```typescript
export class CreateAccountCommand implements ICommand {
    constructor(
        public readonly name: string,
        // other params...
    ) {
    }
}

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler
    implements ICommandHandler<CreateAccountCommand> {
    constructor(
        private readonly accountsRepository: AccountsRepository,
        private readonly eventBus: EventBus,
    ) {
    }

    async execute(command: CreateAccountCommand): Promise<Account> {
        // Implementation...
        // Emit event...
        return account;
    }
}
```

#### B. Create Query Handlers

1. Create a `queries` directory inside `application`
2. Implement the following query handlers:
    - `GetAccountByIdQueryHandler`
    - `GetAllAccountsQueryHandler`
    - `GetAccountBalanceQueryHandler`
    - `GetTotalBalanceQueryHandler`

Don't forget to:

- Use the `@QueryHandler()` decorator

Example structure:

```typescript
export class GetAllAccountsQuery implements IQuery {
    constructor(public readonly userId: string) {
    }
}

@QueryHandler(GetAllAccountsQuery)
export class GetAllAccountsQueryHandler
    implements IQueryHandler<GetAllAccountsQuery> {
    constructor(private readonly accountsRepository: AccountsRepository) {
    }

    async execute(query: GetAllAccountsQuery): Promise<Account[]> {
        return this.accountsRepository.findAll(query.userId);
    }
}
```

### 3. Update the Controller

Refactor the `AccountsController` to use CommandBus and QueryBus instead of directly injecting use cases:

1. Inject `CommandBus` and `QueryBus` in the constructor
2. Replace use case calls with command/query dispatching
3. Map DTOs to command parameters in the controller (do not use DTOs in command handlers)
4. Add appropriate return types to all methods

Example:

```typescript

@Controller('accounts')
export class AccountsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {
    }

    @Post()
    async create(
        @Body() createAccountDto: CreateAccountDto,
        @User() user: RequestUser,
    ): Promise<Account> {
        return this.commandBus.execute(
            new CreateAccountCommand(
                createAccountDto.name,
                // other params...
            ),
        );
    }

    // Other methods...
}
```

### 4. Update the Module Definition

Update the `AccountsModule` to:

1. Import the `CqrsModule`
2. Register all command and query handlers
3. Register the repository
4. Export necessary components

Example:

```typescript

@Module({
    imports: [AuthModule, CqrsModule],
    controllers: [AccountsController],
    providers: [
        AccountsRepository,
        ...commandHandlers,
        ...queryHandlers,
    ],
    exports: [
        AccountsRepository,
        CqrsModule,
    ],
})
export class AccountsModule {
}
```

### 5. Ensure Events are Properly Defined

Check that you have the following events defined in the `core/events` directory:

- `AccountCreatedEvent`
- `AccountUpdatedEvent`
- `AccountRemovedEvent`

Create any missing events following this structure:

```typescript
export class AccountCreatedEvent implements IEvent {
    constructor(
        public readonly accountId: string,
        public readonly userId: string,
    ) {
    }
}
```

### 6. Clean Up Unused Code

After successfully refactoring to CQRS/EDA:

- Remove the old use case files that are no longer needed
- Test the application to ensure everything still works

## Key Design Principles to Follow

1. **Separation of Concerns through CQRS**:
    - Commands handle write operations
    - Queries handle read operations
    - Events signal important state changes

2. **Maintain Clean Architecture Boundaries**:
    - Continue using the existing layers (`api`, `application`, `core`, `infrastructure`)
    - Application layer should not depend on API layer
    - DTOs belong to the API layer, not application layer
    - Domain entities should be used across all layers

3. **Explicit Return Types**:
    - All handlers should have explicit return types
    - Controller methods should have explicit return types

4. **Event-Driven Communication**:
    - Operations that change state should emit events
    - Events enable loose coupling between components
    - Events belong in the domain layer

## Testing

After completing the refactoring, run the k6 tests to ensure the application still works correctly:

```
npm run test:k6
```

## Resources

- [NestJS CQRS Documentation](https://docs.nestjs.com/recipes/cqrs)
- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Vertical Slice Architecture](https://jimmybogard.com/vertical-slice-architecture/)
