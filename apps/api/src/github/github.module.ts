import { Module } from '@nestjs/common';
import { GitHubService } from './github.service';
import { GitHubController } from './github.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [GitHubController],
  providers: [GitHubService, PrismaService],
  exports: [GitHubService],
})
export class GitHubModule {}
