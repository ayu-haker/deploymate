import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { PrismaService } from '../prisma.service';
import { GitHubModule } from '../github/github.module';

@Module({
  imports: [GitHubModule],
  controllers: [AIController],
  providers: [AIService, PrismaService],
  exports: [AIService],
})
export class AIModule {}
