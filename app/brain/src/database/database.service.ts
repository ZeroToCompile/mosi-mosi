import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Pool, type QueryResult, type QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool | null = null;

  onModuleInit() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }

    this.pool = new Pool({ connectionString });
    this.logger.log('Postgres pool ready');
  }

  async onModuleDestroy() {
    await this.pool?.end();
    this.pool = null;
  }

  get client(): Pool {
    if (!this.pool) {
      throw new Error('Database pool is not initialized');
    }
    return this.pool;
  }

  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    return this.client.query<T>(text, params);
  }
}
