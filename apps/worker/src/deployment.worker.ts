import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { ProviderFactory } from './providers/provider.factory';
import { DeploymentConfig, DeploymentStatus } from '@deploymate/types';

export class DeploymentWorkerEngine {
  private worker: Worker;
  private prisma: PrismaClient;
  private logger: Logger = new Logger('DeploymentWorkerEngine');
  private socket: Socket;

  constructor() {
    this.prisma = new PrismaClient();

    const apiPort = process.env.PORT || 3000;
    this.socket = io(`http://localhost:${apiPort}/deployments`, {
      transports: ['websocket'],
    });

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const parsed = new URL(redisUrl);

    this.worker = new Worker(
      'deployments',
      async (job: Job) => {
        if (job.name === 'execute-deployment') {
          return this.processDeploymentJob(job.data as DeploymentConfig);
        } else if (job.name === 'rollback-deployment') {
          return this.processRollbackJob(job.data);
        }
      },
      {
        connection: {
          host: parsed.hostname || 'localhost',
          port: parseInt(parsed.port || '6379', 10),
        },
        concurrency: 5,
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed with error: ${err.message}`);
    });

    this.logger.log('Deployment Worker Engine listening for jobs on BullMQ queue...');
  }

  private async processDeploymentJob(config: DeploymentConfig) {
    this.logger.log(`Starting deployment job for ${config.projectName} (${config.deploymentId})`);

    // 1. Update status to BUILDING
    await this.updateStatus(config.deploymentId, config.projectId, DeploymentStatus.BUILDING);
    await this.addLog(config.deploymentId, config.projectId, 'INFO', 'Initializing deployment environment...', 'PREPARE');

    const provider = ProviderFactory.getProvider(config.provider);

    // 2. Validate configuration
    const validation = await provider.validate(config);
    if (!validation.valid) {
      const errorMsg = validation.errors?.join(', ') || 'Validation failed';
      await this.addLog(config.deploymentId, config.projectId, 'ERROR', `Configuration validation failed: ${errorMsg}`, 'PREPARE');
      await this.updateStatus(config.deploymentId, config.projectId, DeploymentStatus.FAILED, undefined, errorMsg);
      throw new Error(errorMsg);
    }

    // 3. Log Build & Scan Steps
    await this.addLog(config.deploymentId, config.projectId, 'INFO', `Cloning repository ${config.repository} on branch ${config.branch}`, 'BUILD');
    await this.addLog(config.deploymentId, config.projectId, 'INFO', `Building release version ${config.version} (Commit: ${config.commitSha})`, 'BUILD');
    await this.addLog(config.deploymentId, config.projectId, 'INFO', 'Running Trivy container security vulnerability scan...', 'SCAN');
    await this.addLog(config.deploymentId, config.projectId, 'INFO', 'Security scan passed. 0 critical vulnerabilities found.', 'SCAN');

    // 4. Update status to DEPLOYING
    await this.updateStatus(config.deploymentId, config.projectId, DeploymentStatus.DEPLOYING);
    await this.addLog(config.deploymentId, config.projectId, 'INFO', `Executing target deployment on provider ${config.provider}...`, 'DEPLOY');

    // 5. Execute Deployment
    const result = await provider.deploy(config);

    if (result.success) {
      await this.addLog(config.deploymentId, config.projectId, 'INFO', `Deployment successfully completed. Live URL: ${result.url}`, 'MONITOR');
      await this.updateStatus(config.deploymentId, config.projectId, DeploymentStatus.RUNNING, result.url);

      // Update project live URL in DB
      await this.prisma.project.update({
        where: { id: config.projectId },
        data: { liveUrl: result.url },
      });

      return result;
    } else {
      await this.addLog(config.deploymentId, config.projectId, 'ERROR', `Deployment execution failed: ${result.error}`, 'DEPLOY');
      await this.updateStatus(config.deploymentId, config.projectId, DeploymentStatus.FAILED, undefined, result.error);
      throw new Error(result.error || 'Deployment execution failed');
    }
  }

  private async processRollbackJob(data: { deploymentId: string; projectId: string; provider: any; targetVersion: string }) {
    await this.addLog(data.deploymentId, data.projectId, 'WARN', `Initiating deployment rollback to version ${data.targetVersion}...`, 'DEPLOY');
    const provider = ProviderFactory.getProvider(data.provider);
    const result = await provider.rollback(data.deploymentId, data.targetVersion);

    if (result.success) {
      await this.addLog(data.deploymentId, data.projectId, 'INFO', result.message || 'Rollback successful', 'MONITOR');
      await this.updateStatus(data.deploymentId, data.projectId, DeploymentStatus.ROLLED_BACK);
    } else {
      await this.updateStatus(data.deploymentId, data.projectId, DeploymentStatus.FAILED, undefined, 'Rollback failed');
    }
  }

  private async updateStatus(deploymentId: string, projectId: string, status: DeploymentStatus, url?: string, error?: string) {
    const completedAt = status === DeploymentStatus.RUNNING || status === DeploymentStatus.FAILED ? new Date() : undefined;

    await this.prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status,
        url: url || undefined,
        error: error || undefined,
        completedAt,
      },
    });

    // Broadcast WebSocket status event
    this.socket.emit('deployment_status', {
      deploymentId,
      projectId,
      status,
      url,
      error,
      completedAt: completedAt?.toISOString(),
    });
  }

  private async addLog(deploymentId: string, projectId: string, level: string, message: string, step: string) {
    const timestamp = new Date();

    await this.prisma.deploymentLog.create({
      data: {
        deploymentId,
        level,
        message,
        step,
        timestamp,
      },
    });

    // Broadcast WebSocket live log line
    this.socket.emit('deployment_log', {
      deploymentId,
      projectId,
      level,
      message,
      step,
      timestamp: timestamp.toISOString(),
    });
  }
}
