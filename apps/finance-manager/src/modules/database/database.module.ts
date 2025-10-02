import {Global, Module} from '@nestjs/common';
import {
  ConfigurableDatabaseModule,
  DATABASE_OPTIONS,
} from './database.module-definition';
import {DatabaseOptions} from './database-options';
import {Pool} from 'pg';
import {CamelCasePlugin, PostgresDialect} from 'kysely';
import {Database} from './database';

@Global()
@Module({
  exports: [Database],
  providers: [
    {
      provide: Database,
      inject: [DATABASE_OPTIONS],
      useFactory: (databaseOptions: DatabaseOptions) => {
        const dialect = new PostgresDialect({
          pool: new Pool({
            host: databaseOptions.host,
            port: databaseOptions.port,
            user: databaseOptions.user,
            password: databaseOptions.password,
            database: databaseOptions.database,
          }),
        });

        return new Database({
          dialect,
          plugins: [new CamelCasePlugin()],
        });
      },
    },
  ],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}
