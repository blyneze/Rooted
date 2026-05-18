import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    let url = process.env.DATABASE_URL || '';
    
    // Bypassing Render's internal DNS resolution issue by hot-swapping 
    // short internal hostnames with fully-qualified external domains.
    if (url && url.includes('@dpg-') && !url.includes('.render.com')) {
      const match = url.match(/@([a-z0-9-]+)([:\/])/i);
      if (match) {
        const shortHost = match[1];
        const suffix = '.oregon-postgres.render.com';
        url = url.replace(`@${shortHost}`, `@${shortHost}${suffix}`);
      }
    }

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

    // Mask database password for safe, secure container logging
    if (url) {
      const hostDetails = url.includes('@') ? url.split('@')[1] : url;
      console.log(`[PrismaService] Resolving connection to database target: ${hostDetails}`);
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

