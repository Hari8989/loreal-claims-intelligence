import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL must be configured before starting the backend.');
    }

    const pool = new Pool({ connectionString });

    super({
      adapter: new PrismaPg(pool, { disposeExternalPool: true }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    // PrismaPg disposes the externally supplied pool when Prisma disconnects.
    await this.$disconnect();
  }

  async checkDatabaseConnection(): Promise<boolean> {
    await this.$queryRaw`SELECT 1 AS result`;
    return true;
  }
}
