# Seminar 9: Implementing Aggregate Root Pattern

In this seminar, you will enhance the Accounts module by implementing the Aggregate Root pattern from Domain-Driven
Design. Building on the CQRS and Event-Driven Architecture implemented in Seminar 8, you'll now refactor the existing
code to use Aggregates to better encapsulate domain logic and ensure consistency.

## Background

An Aggregate is a cluster of domain objects that can be treated as a single unit. An Aggregate Root is the entity at the
top of this cluster, acting as the entry point to the aggregate and ensuring the consistency of changes to all objects
within the aggregate boundary. This pattern is a key concept in Domain-Driven Design (DDD) and helps manage complex
domains by clearly defining consistency boundaries.

## Objective

Refactor the existing Accounts module to use the Aggregate Root pattern, centralizing domain logic and business rules
within the aggregate and updating the existing handlers and controllers to work with this pattern.

## Instructions

### 1. Create the Account Aggregate

Create a new directory `aggregates` under the `core` folder and implement the `AccountAggregate` class:

```typescript
// core/aggregates/account.aggregate.ts
import {AggregateRoot} from '@nestjs/cqrs';

export class AccountAggregate extends AggregateRoot {
    private _id: string;
    // Other private properties...

    // Getters
    get id(): string {
        return this._id;
    }

    // Domain methods
    create(name: string, accountType: AccountType, ...): void {
        // Set properties
        // Apply domain event
    }

    update(data: { ... }): void {
        // Apply business rules
        // Apply domain event
    }

    // This is a simplification, AggregateRoot has builtin loadFromHistory()
    // loadFromHistory is used to recreate the current state of the aggregate
    // by applying events stored in event store
    loadState(): void {
        // Populate properties from persistence
    }
}
```

### 2. Implement the Aggregate Repository

Create `accounts-aggregate.repository.ts` in the `infrastructure/repositories` directory:

```typescript
// infrastructure/repositories/accounts-aggregate.repository.ts
@Injectable()
export class AccountAggregateRepository {
    constructor(
        private readonly db: Database,
        private readonly publisher: EventPublisher,
    ) {
    }

    async findById(id: string, userId: string): Promise<AccountAggregate | null> {
        // Query database
        // Return the aggregate
    }

    async createAccount(aggregate: AccountAggregate): Promise<void> {
        // Persist to database
        // Commit events
    }

    // Other methods for updating, removing, and querying accounts
}
```

### 3. Refactor Command Handlers

Update the existing command handlers to use the aggregate:

```typescript
// Example: CreateAccountCommandHandler
@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler
    implements ICommandHandler<CreateAccountCommand> {
    constructor(
        private readonly accountAggregateRepository: AccountAggregateRepository,
    ) {
    }

    async execute(command: CreateAccountCommand) {
        const accountAggregate = new AccountAggregate();
        accountAggregate.create(
            command.name,
            command.accountType,
            // Other properties...
        );

        await this.accountAggregateRepository.createAccount(accountAggregate);

    }
}
```

### 4. Update the Module

Modify the `accounts.module.ts` file to register the aggregate repository:

```typescript

@Module({
    imports: [AuthModule, CqrsModule],
    controllers: [AccountsController],
    providers: [
        AccountsRepository,
        AccountAggregateRepository,
        ...commandHandlers,
        ...queryHandlers,
    ],
    exports: [
        AccountsRepository,
        AccountAggregateRepository,
        CqrsModule,
    ],
})
export class AccountsModule {
}
```

## Key Design Principles

1. **Encapsulation of Domain Logic**
    - Business rules belong in the Aggregate
    - The Aggregate ensures consistency
    - All changes to an Aggregate go through the Aggregate Root

2. **Consistency Boundaries**
    - Each Aggregate defines a transactional boundary
    - Changes within the Aggregate must be consistent
    - References between Aggregates use identity, not direct object references

3. **Behavioral Focus**
    - The Aggregate is not just a data structure
    - Domain logic is expressed as behavior (methods)
    - Use domain language in method names and parameters

4. **Event-Driven State Changes**
    - State changes within the Aggregate are communicated via Domain Events
    - Events are expressed in past tense (e.g., AccountCreated)
    - Events describe what happened, not how the system reacted

## Advantages of Using Aggregates

1. **Stronger Domain Model**
    - Centralizes domain logic in one place
    - Makes business rules explicit
    - Prevents invalid states

2. **Better Testing**
    - Domain logic can be tested in isolation
    - Behavior is focused and well-defined

3. **Improved Maintainability**
    - Changes to business rules are contained within the Aggregate
    - Reduces side effects when changing code

4. **Clear Boundaries**
    - Defines what belongs together
    - Makes the system more understandable

## Resources

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Implementing Domain-Driven Design by Vaughn Vernon](https://www.amazon.com/Implementing-Domain-Driven-Design-Vaughn-Vernon/dp/0321834577)
- [NestJS CQRS Documentation](https://docs.nestjs.com/recipes/cqrs)
