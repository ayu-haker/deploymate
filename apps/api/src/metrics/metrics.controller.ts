import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import * as client from 'prom-client';

// Prometheus Metrics Registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const deploymentTotalCounter = new client.Counter({
  name: 'deploymate_deployment_total',
  help: 'Total number of deployments triggered',
  labelNames: ['provider', 'status'],
  registers: [register],
});

export const aiDiagnosisCounter = new client.Counter({
  name: 'deploymate_ai_diagnosis_total',
  help: 'Total AI diagnosis executed',
  labelNames: ['severity', 'action'],
  registers: [register],
});

@ApiTags('monitoring')
@Controller()
export class MetricsController {
  @Get('health')
  @ApiOperation({ summary: 'Liveness health check endpoint' })
  getHealth() {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe endpoint' })
  getReady() {
    return { ready: true, services: { database: 'connected', redis: 'connected' } };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  }
}
