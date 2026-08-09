import { Logger } from '@nestjs/common';
import { DeploymentWorkerEngine } from './deployment.worker';

async function bootstrapWorker() {
  const logger = new Logger('WorkerBootstrap');
  logger.log('Starting DeployMate Deployment Worker Process...');
  new DeploymentWorkerEngine();
}

bootstrapWorker();
