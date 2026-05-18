import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    let url = process.env.DATABASE_URL || '';
    
    // Auto-append sslmode=disable for safe internal network connections (Render production)
    // if not already specified in the connection string.
    if (url && !url.includes('sslmode=')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}sslmode=disable`;
    }

    super({
      datasources: {
        db: {
          url: url,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

