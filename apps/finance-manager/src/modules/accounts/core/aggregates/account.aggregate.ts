import { AggregateRoot } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { AccountCreatedEvent } from '../events/account-created.event';
import { AccountUpdatedEvent } from '../events/account-updated.event';
import { AccountRemovedEvent } from '../events/account-removed.event';
import { AccountType } from '../../../shared-kernel/core/types/db';
import { AccountReconciledEvent } from '../events/account-reconciled.event';

export class AccountAggregate extends AggregateRoot {
  private _id: string;
  private _name: string;
  private _accountType: AccountType;
  private _currency: string;
  private _description: string | null;
  private _initialBalance: number;
  private _isActive: boolean;
  private _lastReconciled: Date | null;
  private _color: string | null;
  private _icon: string | null;
  private _userId: string;
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

  get name(): string {
    return this._name;
  }

  get accountType(): AccountType {
    return this._accountType;
  }

  get currency(): string {
    return this._currency;
  }

  get description(): string | null {
    return this._description;
  }

  get initialBalance(): number {
    return this._initialBalance;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lastReconciled(): Date | null {
    return this._lastReconciled;
  }

  get color(): string | null {
    return this._color;
  }

  get icon(): string | null {
    return this._icon;
  }

  get userId(): string {
    return this._userId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  create(
    name: string,
    accountType: AccountType,
    currency: string,
    userId: string,
    description?: string,
    initialBalance: number = 0,
    icon?: string,
    color?: string,
  ): void {
    if (!name || !accountType || !currency || !userId) {
      throw new BadRequestException(
        'Name, account type, currency and user ID are required',
      );
    }

    this._id = crypto.randomUUID();
    this._name = name;
    this._accountType = accountType;
    this._currency = currency;
    this._description = description || null;
    this._initialBalance = initialBalance;
    this._isActive = true;
    this._lastReconciled = new Date();
    this._icon = icon || null;
    this._color = color || null;
    this._userId = userId;
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
    const changes: Record<string, unknown> = {};

    if (data.name && data.name !== this._name) {
      this._name = data.name;
      changes.name = data.name;
    }

    if (
      data.description !== undefined &&
      data.description !== this._description
    ) {
      this._description = data.description;
      changes.description = data.description;
    }

    if (data.icon !== undefined && data.icon !== this._icon) {
      this._icon = data.icon;
      changes.icon = data.icon;
    }

    if (data.color !== undefined && data.color !== this._color) {
      this._color = data.color;
      changes.color = data.color;
    }

    if (Object.keys(changes).length > 0) {
      this._updatedAt = new Date();
      changes.updatedAt = this._updatedAt;

      this.apply(
        new AccountUpdatedEvent(
          this._id,
          this._userId,
          data.name,
          this._accountType,
        ),
      );
    }
  }

  reconcile(actualBalance: number, _notes?: string): void {
    this._initialBalance = actualBalance;
    this._lastReconciled = new Date();
    this._updatedAt = new Date();

    this.apply(new AccountReconciledEvent(this._id));
  }

  remove(): void {
    this.apply(new AccountRemovedEvent(this._id, this._userId));
  }

  loadState(history: {
    id: string;
    name: string;
    accountType: AccountType;
    currency: string;
    description: string | null;
    initialBalance: number;
    isActive: boolean;
    lastReconciled: Date | null;
    color: string | null;
    icon: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): void {
    this._id = history.id;
    this._name = history.name;
    this._accountType = history.accountType;
    this._currency = history.currency;
    this._description = history.description;
    this._initialBalance = history.initialBalance;
    this._isActive = history.isActive;
    this._lastReconciled = history.lastReconciled;
    this._color = history.color;
    this._icon = history.icon;
    this._userId = history.userId;
    this._createdAt = history.createdAt;
    this._updatedAt = history.updatedAt;
  }
}
