import { z } from 'zod';

// ==========================================
// Enums
// ==========================================
export enum ProviderType {
  KUBERNETES = 'KUBERNETES',
  VERCEL = 'VERCEL',
  NETLIFY = 'NETLIFY',
}

export enum DeploymentStatus {
  QUEUED = 'QUEUED',
  BUILDING = 'BUILDING',
  DEPLOYING = 'DEPLOYING',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  ROLLING_BACK = 'ROLLING_BACK',
  ROLLED_BACK = 'ROLLED_BACK',
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ActionType {
  UPDATE_IMAGE = 'UPDATE_IMAGE',
  UPDATE_ENVIRONMENT = 'UPDATE_ENVIRONMENT',
  RESTART_DEPLOYMENT = 'RESTART_DEPLOYMENT',
  ROLLBACK = 'ROLLBACK',
  UPDATE_REPLICAS = 'UPDATE_REPLICAS',
  UPDATE_RESOURCES = 'UPDATE_RESOURCES',
  UPDATE_DOCKERFILE = 'UPDATE_DOCKERFILE',
  UPDATE_DEPENDENCY = 'UPDATE_DEPENDENCY',
}

export enum FixStatus {
  PROPOSED = 'PROPOSED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  APPLYING = 'APPLYING',
  APPLIED = 'APPLIED',
  FAILED = 'FAILED',
}

// ==========================================
// Provider Abstraction Interfaces
// ==========================================
export interface DeploymentConfig {
  deploymentId: string;
  projectId: string;
  projectName: string;
  repository: string;
  branch: string;
  commitSha: string;
  commitMsg?: string;
  version: string;
  provider: ProviderType;
  providerCredentials?: Record<string, any>;
  envVars: Record<string, string>;
  k8sNamespace?: string;
  dockerfile?: string;
  buildCmd?: string;
  outputDir?: string;
  framework?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  url?: string;
  version: string;
  error?: string;
}

export interface LogEntry {
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  step: 'PREPARE' | 'BUILD' | 'SCAN' | 'DEPLOY' | 'MONITOR';
  timestamp: string;
}

export interface RollbackResult {
  success: boolean;
  previousVersion: string;
  restoredVersion: string;
  message?: string;
}

export interface DeploymentProvider {
  validate(config: DeploymentConfig): Promise<ValidationResult>;
  deploy(config: DeploymentConfig): Promise<DeploymentResult>;
  getStatus(deploymentId: string): Promise<DeploymentStatus>;
  getLogs(deploymentId: string): Promise<LogEntry[]>;
  cancel(deploymentId: string): Promise<void>;
  rollback(deploymentId: string, targetVersion: string): Promise<RollbackResult>;
}

// ==========================================
// AI Schemas & Action Registry Validation
// ==========================================
export const ActionRegistrySchema = z.object({
  severity: z.nativeEnum(Severity),
  problem: z.string().min(1),
  rootCause: z.string().min(1),
  confidence: z.number().min(0).max(1),
  suggestedFix: z.string().min(1),
  action: z.nativeEnum(ActionType),
  payload: z.record(z.any()).optional(),
  requiresApproval: z.literal(true),
});

export type StructuredAIDiagnosis = z.infer<typeof ActionRegistrySchema>;

export interface DiagnosisInput {
  deploymentId: string;
  logs: LogEntry[];
  error?: string;
  commitSha: string;
  provider: ProviderType;
  dockerfileContent?: string;
  packageJsonContent?: string;
  manifestContent?: string;
  envVarKeys: string[]; // Key names ONLY, NO values for privacy
}

export interface FixInput {
  analysis: StructuredAIDiagnosis;
  repository: string;
  branch: string;
  commitSha: string;
}

export interface FixProposal {
  id: string;
  analysisId: string;
  action: ActionType;
  diff: string;
  explanation: string;
  branchName?: string;
  riskLevel: Severity;
}

export interface AIProvider {
  diagnose(input: DiagnosisInput): Promise<StructuredAIDiagnosis>;
  generateFix(input: FixInput): Promise<FixProposal>;
}

// ==========================================
// API Response & Envelope Types
// ==========================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    requestId?: string;
    details?: any;
  };
}

// ==========================================
// WebSocket Events DTOs
// ==========================================
export interface WsDeploymentLogEvent {
  deploymentId: string;
  projectId: string;
  level: string;
  message: string;
  step: string;
  timestamp: string;
}

export interface WsDeploymentStatusEvent {
  deploymentId: string;
  projectId: string;
  status: DeploymentStatus;
  url?: string;
  error?: string;
  completedAt?: string;
}

// ==========================================
// GitHub Integration Types
// ==========================================
export interface Repository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  defaultBranch: string;
}

export interface Branch {
  name: string;
  commitSha: string;
  protected: boolean;
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface GitHubProvider {
  getRepositories(accessToken: string): Promise<Repository[]>;
  getBranches(accessToken: string, repoFullName: string): Promise<Branch[]>;
  getCommits(accessToken: string, repoFullName: string, branch: string): Promise<Commit[]>;
  createBranch(accessToken: string, repoFullName: string, baseBranch: string, newBranch: string): Promise<void>;
  createCommit(accessToken: string, repoFullName: string, branch: string, path: string, content: string, message: string): Promise<string>;
  createPullRequest(accessToken: string, repoFullName: string, title: string, head: string, base: string, body: string): Promise<{ prUrl: string; prNumber: number }>;
}
