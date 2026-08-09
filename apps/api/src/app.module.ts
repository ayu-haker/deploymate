import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { GitHubModule } from './github/github.module';
import { DeploymentsModule } from './deployments/deployments.module';
import { AIModule } from './ai/ai.module';
import { EventsModule } from './events/events.module';
import { MetricsController } from './metrics/metrics.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ProjectsModule,
    GitHubModule,
    DeploymentsModule,
    AIModule,
    EventsModule,
  ],
  controllers: [MetricsController],
  providers: [PrismaService],
})
export class AppModule {}
