import { Injectable } from '@nestjs/common';
import { Database } from './database';
import { DB } from '../../common/types/db';

@Injectable()
export abstract class BaseRepository<T, CreateData, UpdateData> {
  constructor(
    protected db: Database,
    protected tableName: keyof DB,
  ) {}

  // Common CRUD methods that could be useful for all repositories
  protected async create(data: CreateData & { id: string }): Promise<T> {
    return (await this.db
      .insertInto(this.tableName)
      .values(data as any)
      .returningAll()
      .executeTakeFirstOrThrow()) as unknown as T;
  }

  protected async findById(id: string): Promise<T | undefined> {
    return this.db
      .selectFrom(this.tableName)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst() as unknown as T | undefined;
  }

  protected async update(id: string, data: UpdateData): Promise<T | undefined> {
    return this.db
      .updateTable(this.tableName)
      .set({
        ...data,
        updated_at: new Date(),
      } as any)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst() as unknown as T | undefined;
  }

  protected async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom(this.tableName)
      .where('id', '=', id)
      .execute();
    return result.length > 0;
  }
}
