import { AggregateRoot } from '@nestjs/cqrs';
import { AccountType } from '../../../../shared-kernel/core/types/db';
import { AccountCreatedEvent } from '../events/account-created.event';
import { AccountUpdatedEvent } from '../events/account-updated.event';
import { AccountRemovedEvent } from '../events/account-removed.event';

export class AccountAggregate extends AggregateRoot {
  private _id: string;
  private _userId: string;
  private _name: string;
  private _accountType: AccountType;
  private _initialBalance: number;
  private _icon: string | null;
  private _lastReconciled: Date | null;
  private _color: string | null;
  private _description: string | null;
  private _isActive: boolean;
  private _currency: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(id?: string) {
    super();
    if (id) {
      this._id = id;
    }
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get name(): string {
    return this._name;
  }

  get accountType(): AccountType {
    return this._accountType;
  }

  get initialBalance(): number {
    return this._initialBalance;
  }

  get icon(): string | null {
    return this._icon;
  }
  get lastReconciled(): Date | null {
    return this._lastReconciled;
  }
  get color(): string | null {
    return this._color;
  }
  get description(): string | null {
    return this._description;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get currency(): string {
    return this._currency;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  create(
    name: string,
    userId: string,
    accountType: AccountType,
    initialBalance: number,
    currency: string,
    description?: string,
    icon?: string,
    color?: string,
  ): void {
    if (
      !name ||
      !userId ||
      !accountType ||
      initialBalance === undefined ||
      !currency
    ) {
      throw new Error(
        'Name, UserId, AccountType, InitialBalance and Currency are required',
      );
    }

    this._id = crypto.randomUUID();
    this._name = name;
    this._userId = userId;
    this._accountType = accountType;
    this._initialBalance = initialBalance;
    this._currency = currency;
    this._description = description || null;
    this._icon = icon || null;
    this._color = color || null;
    this._isActive = true;
    this._createdAt = new Date();
    this._updatedAt = new Date();

    this.apply(new AccountCreatedEvent(this._id, this._userId));
  }

  update(data: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
  }): void {
    if (data.name !== undefined) {
      this._name = data.name;
    }
    if (data.description !== undefined) {
      this._description = data.description;
    }
    if (data.icon !== undefined) {
      this._icon = data.icon;
    }
    if (data.color !== undefined) {
      this._color = data.color;
    }
    this._updatedAt = new Date();

    this.apply(
      new AccountUpdatedEvent(
        this._id,
        this._userId,
        data.name,
        this._accountType,
      ),
    );
  }

  // This is a simplification, AggregateRoot has builtin loadFromHistory()
  // loadFromHistory is used to recreate the current state of the aggregate
  // by applying events stored in event store
  loadState(history: {
    id: string;
    userId: string;
    name: string;
    accountType: AccountType;
    initialBalance: number;
    icon: string | null;
    lastReconciled: Date | null;
    color: string | null;
    description: string | null;
    isActive: boolean;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  }): void {
    this._id = history.id;
    this._userId = history.userId;
    this._name = history.name;
    this._accountType = history.accountType;
    this._initialBalance = history.initialBalance;
    this._icon = history.icon;
    this._lastReconciled = history.lastReconciled;
    this._color = history.color;
    this._description = history.description;
    this._isActive = history.isActive;
    this._currency = history.currency;
    this._createdAt = history.createdAt;
    this._updatedAt = history.updatedAt;
  }

  remove(): void {
    this._isActive = false;
    this._updatedAt = new Date();
    this.apply(new AccountRemovedEvent(this._id, this._userId));
  }
}
