import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    let url = process.env.DATABASE_URL || '';
    
    // Auto-handle sslmode based on internal vs external connection types
    if (url && !url.includes('sslmode=')) {
      const separator = url.includes('?') ? '&' : '?';
      if (url.includes('.render.com')) {
        // External URL: Enforce SSL (required by Render's public gateway)
        url = `${url}${separator}sslmode=require`;
      } else {
        // Internal URL: Disable SSL (required by Render's private virtual network)
        url = `${url}${separator}sslmode=disable`;
      }
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

