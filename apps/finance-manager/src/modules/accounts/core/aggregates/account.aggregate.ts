import { AggregateRoot } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { AccountType } from '../../../../shared-kernel/core/types/db';
import { AccountCreatedEvent } from '../events/account-created.event';
import { AccountUpdatedEvent } from '../events/account-updated.event';
import { AccountRemovedEvent } from '../events/account-removed.event';
import crypto from 'crypto';

export class AccountAggregate extends AggregateRoot {
  private _id: string;
  private _name: string;
  private _accountType: AccountType;
  private _currency: string;
  private _userId: string;
  private _description?: string;
  private _notes?: string;
  private _icon?: string;
  private _color?: string;
  private _initialBalance: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(id?: string) {
    super();
    if (id) {
      this._id = id;
    }
  }

  // --- Getters (readonly)
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get accountType(): AccountType {
    return this._accountType;
  }

  get currency(): string {
    return this._currency;
  }

  get userId(): string {
    return this._userId;
  }

  get description(): string | undefined {
    return this._description;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get icon(): string | undefined {
    return this._icon;
  }

  get color(): string | undefined {
    return this._color;
  }

  get initialBalance(): string {
    return this._initialBalance;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // --- Create new account (factory-like method)
  create(
    name: string,
    accountType: AccountType,
    currency: string,
    userId: string,
    description?: string,
    notes?: string,
    icon?: string,
    color?: string,
    initialBalance: string = '0',
  ): void {
    if (!name || !accountType || !currency || !userId) {
      throw new BadRequestException('Missing required account fields');
    }

    const balanceNumber = Number(initialBalance);
    if (isNaN(balanceNumber) || balanceNumber < 0) {
      throw new BadRequestException(
        'Initial balance must be a non-negative number',
      );
    }

    this._id = crypto.randomUUID();
    this._name = name;
    this._accountType = accountType;
    this._currency = currency;
    this._userId = userId;
    this._description = description;
    this._notes = notes;
    this._icon = icon;
    this._color = color;
    this._initialBalance = initialBalance;
    this._createdAt = new Date();
    this._updatedAt = new Date();

    this.apply(new AccountCreatedEvent(this._id, this._userId));
  }

  // --- Update account info
  update(data: {
    name?: string;
    description?: string;
    notes?: string;
    icon?: string;
    color?: string;
    initialBalance?: string;
  }): void {
    const changes: Record<string, unknown> = {};

    if (data.name && data.name !== this._name) {
      this._name = data.name;
      changes.name = data.name;
    }

    if (data.description && data.description !== this._description) {
      this._description = data.description;
      changes.description = data.description;
    }

    if (data.notes && data.notes !== this._notes) {
      this._notes = data.notes;
      changes.notes = data.notes;
    }

    if (data.icon && data.icon !== this._icon) {
      this._icon = data.icon;
      changes.icon = data.icon;
    }

    if (data.color && data.color !== this._color) {
      this._color = data.color;
      changes.color = data.color;
    }

    if (
      data.initialBalance !== undefined &&
      data.initialBalance !== this._initialBalance
    ) {
      const balanceNumber = Number(data.initialBalance);
      if (isNaN(balanceNumber) || balanceNumber < 0) {
        throw new BadRequestException(
          'Initial balance must be a non-negative number',
        );
      }
      this._initialBalance = data.initialBalance;
      changes.initialBalance = data.initialBalance;
    }

    if (Object.keys(changes).length > 0) {
      this._updatedAt = new Date();
      changes.updatedAt = this._updatedAt;

      this.apply(new AccountUpdatedEvent(this._id, this._userId));
    }
  }

  // --- Remove account
  remove(): void {
    this.apply(new AccountRemovedEvent(this._id, this._userId));
  }

  // --- Load from persistence (rehydrate)
  loadState(history: {
    id: string;
    name: string;
    accountType: AccountType;
    currency: string;
    userId: string;
    description?: string;
    notes?: string;
    icon?: string;
    color?: string;
    initialBalance: string;
    createdAt: Date;
    updatedAt: Date;
  }): void {
    this._id = history.id;
    this._name = history.name;
    this._accountType = history.accountType;
    this._currency = history.currency;
    this._userId = history.userId;
    this._description = history.description;
    this._notes = history.notes;
    this._icon = history.icon;
    this._color = history.color;
    this._initialBalance = history.initialBalance;
    this._createdAt = history.createdAt;
    this._updatedAt = history.updatedAt;
  }
}
