import { Module } from '@nestjs/common';
import { DeploymentsService } from './deployments.service';
import { DeploymentsController } from './deployments.controller';
import { PrismaService } from '../prisma.service';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [DeploymentsController],
  providers: [DeploymentsService, PrismaService],
  exports: [DeploymentsService],
})
export class DeploymentsModule {}
