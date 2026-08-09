import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // Non-blocking asynchronous connection attempt
    this.$connect()
      .then(() => this.logger.log('Successfully connected to PostgreSQL database'))
      .catch((err) => {
        this.logger.warn(`PostgreSQL DB server unreachable at startup: ${err.message}. Running API Gateway in standalone mode.`);
      });
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {}
  }
}
