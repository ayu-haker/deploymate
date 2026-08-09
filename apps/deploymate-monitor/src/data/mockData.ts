export interface Environment {
  id: string;
  name: string;
  slug: string;
  status: 'healthy' | 'degraded' | 'down';
  lastDeployTime: string;
  commitHash: string;
  branch: string;
  uptime: number; // e.g. 99.98
  cpuUsage: number[]; // telemetry history
  memoryUsage: number[]; // MB
  responseTime: number[]; // ms
  services: { name: string; status: 'healthy' | 'degraded' | 'down'; latency: number }[];
  envVars: { key: string; value: string }[];
}

export interface PipelineRun {
  id: string;
  projectName: string;
  branch: string;
  commitHash: string;
  commitMessage: string;
  environment: string;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED';
  duration: string;
  relativeTime: string;
  author: string;
  stages: {
    name: 'Build' | 'Test' | 'Deploy';
    status: 'SUCCESS' | 'RUNNING' | 'FAILED' | 'PENDING';
    duration: string;
    logSnippet?: string;
  }[];
}

export interface LogLine {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  service: string;
  environment: string;
  message: string;
  metadata?: Record<string, any>;
}

export const MOCK_ENVIRONMENTS: Environment[] = [
  {
    id: 'env-prod',
    name: 'Production',
    slug: 'production',
    status: 'healthy',
    lastDeployTime: '4m ago',
    commitHash: 'a83f92d',
    branch: 'main',
    uptime: 99.99,
    cpuUsage: [18, 24, 22, 28, 25, 31, 29, 26, 24, 28, 22, 25],
    memoryUsage: [410, 425, 418, 430, 442, 438, 450, 440, 432, 428, 435, 440],
    responseTime: [42, 38, 45, 41, 39, 44, 40, 37, 43, 41, 39, 40],
    services: [
      { name: 'api-gateway', status: 'healthy', latency: 24 },
      { name: 'auth-service', status: 'healthy', latency: 18 },
      { name: 'telemetry-worker', status: 'healthy', latency: 32 },
      { name: 'postgres-primary', status: 'healthy', latency: 8 },
    ],
    envVars: [
      { key: 'DATABASE_URL', value: 'postgres://deploymate_prod:s3cur3p@ss@db.cluster.internal:5432/prod' },
      { key: 'JWT_SECRET', value: 'mock_jwt_secret_token_key_123' },
      { key: 'REDIS_CACHE_URL', value: 'redis://cache.internal:6379' },
      { key: 'OLLAMA_INFERENCE_URL', value: 'http://ai-node.internal:11434' },
    ],
  },
  {
    id: 'env-staging',
    name: 'Staging',
    slug: 'staging',
    status: 'degraded',
    lastDeployTime: '18m ago',
    commitHash: 'b94e11c',
    branch: 'staging',
    uptime: 98.45,
    cpuUsage: [45, 52, 68, 74, 82, 79, 85, 78, 71, 65, 58, 62],
    memoryUsage: [780, 810, 840, 890, 920, 950, 930, 910, 880, 860, 840, 850],
    responseTime: [142, 185, 210, 245, 310, 280, 295, 260, 230, 195, 180, 190],
    services: [
      { name: 'api-gateway', status: 'healthy', latency: 45 },
      { name: 'auth-service', status: 'degraded', latency: 280 },
      { name: 'telemetry-worker', status: 'healthy', latency: 55 },
      { name: 'redis-replica', status: 'healthy', latency: 12 },
    ],
    envVars: [
      { key: 'DATABASE_URL', value: 'postgres://staging:pass@staging-db:5432/staging' },
      { key: 'LOG_LEVEL', value: 'debug' },
      { key: 'MAX_WORKER_THREADS', value: '8' },
    ],
  },
  {
    id: 'env-preview',
    name: 'Preview (PR-142)',
    slug: 'preview-pr-142',
    status: 'down',
    lastDeployTime: '2m ago',
    commitHash: 'f419c8e',
    branch: 'feat/telemetry-stream',
    uptime: 0.0,
    cpuUsage: [10, 12, 15, 95, 100, 100, 100, 0, 0, 0, 0, 0],
    memoryUsage: [200, 220, 250, 980, 1024, 1024, 0, 0, 0, 0, 0, 0],
    responseTime: [50, 52, 85, 2400, 5000, 5000, 0, 0, 0, 0, 0, 0],
    services: [
      { name: 'api-gateway', status: 'down', latency: 0 },
      { name: 'auth-service', status: 'healthy', latency: 22 },
      { name: 'preview-proxy', status: 'down', latency: 0 },
    ],
    envVars: [
      { key: 'PREVIEW_ID', value: 'pr-142-telemetry' },
      { key: 'NODE_ENV', value: 'test' },
    ],
  },
];

export const MOCK_PIPELINES: PipelineRun[] = [
  {
    id: 'run-101',
    projectName: 'DeployMate Core Gateway',
    branch: 'main',
    commitHash: 'a83f92d',
    commitMessage: 'feat(telemetry): stream live k8s pod events over websocket',
    environment: 'Production',
    status: 'SUCCESS',
    duration: '1m 42s',
    relativeTime: '4m ago',
    author: 'Ayushman Bosu Roy',
    stages: [
      { name: 'Build', status: 'SUCCESS', duration: '45s' },
      { name: 'Test', status: 'SUCCESS', duration: '32s' },
      { name: 'Deploy', status: 'SUCCESS', duration: '25s' },
    ],
  },
  {
    id: 'run-102',
    projectName: 'AI Inference Service',
    branch: 'feat/telemetry-stream',
    commitHash: 'f419c8e',
    commitMessage: 'fix(ollama): patch structured JSON output schema parser',
    environment: 'Preview (PR-142)',
    status: 'FAILED',
    duration: '2m 15s',
    relativeTime: '2m ago',
    author: 'Ayushman Bosu Roy',
    stages: [
      { name: 'Build', status: 'SUCCESS', duration: '50s' },
      { name: 'Test', status: 'SUCCESS', duration: '48s' },
      {
        name: 'Deploy',
        status: 'FAILED',
        duration: '37s',
        logSnippet: 'Build failed at step 3 — dependency install timed out.\nERR! ETIMEDOUT network request to registry.npmjs.org/@deploymate/types failed.\nRetry, or view the full log.',
      },
    ],
  },
  {
    id: 'run-103',
    projectName: 'Telemetry Worker Daemon',
    branch: 'staging',
    commitHash: 'b94e11c',
    commitMessage: 'perf(redis): optimize pub/sub subscriber connection pool',
    environment: 'Staging',
    status: 'RUNNING',
    duration: '1m 10s',
    relativeTime: 'In Progress',
    author: 'Ayushman Bosu Roy',
    stages: [
      { name: 'Build', status: 'SUCCESS', duration: '42s' },
      { name: 'Test', status: 'RUNNING', duration: '28s' },
      { name: 'Deploy', status: 'PENDING', duration: '--' },
    ],
  },
  {
    id: 'run-104',
    projectName: 'Authentication Service',
    branch: 'main',
    commitHash: 'c05f22d',
    commitMessage: 'security(otp): add 2-factor email verification & bcrypt hashing',
    environment: 'Production',
    status: 'SUCCESS',
    duration: '2m 04s',
    relativeTime: '1h ago',
    author: 'Ayushman Bosu Roy',
    stages: [
      { name: 'Build', status: 'SUCCESS', duration: '55s' },
      { name: 'Test', status: 'SUCCESS', duration: '41s' },
      { name: 'Deploy', status: 'SUCCESS', duration: '28s' },
    ],
  },
  {
    id: 'run-105',
    projectName: 'K8s Cluster Operator',
    branch: 'main',
    commitHash: 'd16e33a',
    commitMessage: 'chore(deps): bump helm chart definitions for ingress-nginx',
    environment: 'Production',
    status: 'SUCCESS',
    duration: '3m 12s',
    relativeTime: '3h ago',
    author: 'DevOps Bot',
    stages: [
      { name: 'Build', status: 'SUCCESS', duration: '1m 10s' },
      { name: 'Test', status: 'SUCCESS', duration: '1m 02s' },
      { name: 'Deploy', status: 'SUCCESS', duration: '1m 00s' },
    ],
  },
];

export const MOCK_LOGS: LogLine[] = [
  {
    id: 'log-1',
    timestamp: '23:54:02.842',
    severity: 'ERROR',
    service: 'api-gateway',
    environment: 'Preview (PR-142)',
    message: 'Build failed at step 3 — dependency install timed out.',
    metadata: { error: 'ETIMEDOUT', registry: 'registry.npmjs.org', timeoutMs: 30000, attempt: 3 },
  },
  {
    id: 'log-2',
    timestamp: '23:54:01.120',
    severity: 'WARN',
    service: 'auth-service',
    environment: 'Staging',
    message: 'High latency detected in password verification thread pool [280ms > 100ms threshold]',
    metadata: { threadPoolUsage: '92%', activeWorkers: 8, poolMax: 8 },
  },
  {
    id: 'log-3',
    timestamp: '23:53:58.490',
    severity: 'INFO',
    service: 'telemetry-worker',
    environment: 'Production',
    message: 'WebSocket subscriber stream established on channel k8s.deployments.events',
    metadata: { clientId: 'ws_sub_99182', ip: '10.16.1.67', protocol: 'wss' },
  },
  {
    id: 'log-4',
    timestamp: '23:53:55.201',
    severity: 'INFO',
    service: 'api-gateway',
    environment: 'Production',
    message: 'HTTP POST /api/v1/auth/verify-otp 200 OK - 14ms',
    metadata: { status: 200, durationMs: 14, userAgent: 'DeployMate-Mobile/1.0' },
  },
  {
    id: 'log-5',
    timestamp: '23:53:50.015',
    severity: 'DEBUG',
    service: 'ai-provider',
    environment: 'Production',
    message: 'Ollama local inference response received from http://ai-node.internal:11434',
    metadata: { model: 'llama3', promptTokens: 412, completionTokens: 184, evalTimeMs: 420 },
  },
  {
    id: 'log-6',
    timestamp: '23:53:44.912',
    severity: 'ERROR',
    service: 'preview-proxy',
    environment: 'Preview (PR-142)',
    message: '502 Bad Gateway: Upstream container pr-142-app exited with code 137 (OOMKilled)',
    metadata: { exitCode: 137, memoryLimit: '1024MB', peakUsage: '1048MB' },
  },
  {
    id: 'log-7',
    timestamp: '23:53:40.100',
    severity: 'INFO',
    service: 'auth-service',
    environment: 'Production',
    message: 'Nodemailer SMTP session authenticated with smtp.gmail.com:587',
    metadata: { smtpUser: 'ayushmanbosuroy@gmail.com', tls: true },
  },
];
