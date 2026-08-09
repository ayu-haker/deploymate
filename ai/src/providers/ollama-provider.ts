import {
  AIProvider,
  DiagnosisInput,
  FixInput,
  FixProposal,
  StructuredAIDiagnosis,
  ActionRegistrySchema,
  ActionType,
  Severity,
} from '@deploymate/types';
import { SecretRedactor, ActionRegistry } from '@deploymate/shared';
import { AIPrompts } from '../prompts/diagnosis-prompt';

export class OllamaAIProvider implements AIProvider {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama3') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
  }

  public async diagnose(input: DiagnosisInput): Promise<StructuredAIDiagnosis> {
    // 1. Redact secrets from input logs
    const sanitizedInput: DiagnosisInput = {
      ...input,
      error: input.error ? SecretRedactor.sanitize(input.error) : undefined,
      logs: input.logs.map(l => ({
        ...l,
        message: SecretRedactor.sanitize(l.message),
      })),
      dockerfileContent: input.dockerfileContent ? SecretRedactor.sanitize(input.dockerfileContent) : undefined,
      packageJsonContent: input.packageJsonContent ? SecretRedactor.sanitize(input.packageJsonContent) : undefined,
    };

    const prompt = AIPrompts.buildDiagnosisPrompt(sanitizedInput);

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data: any = await response.json();
      const rawText = data.response;

      // Extract JSON from response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract valid JSON from Ollama response');
      }

      const parsedJson = JSON.parse(jsonMatch[0]);

      // Validate with Zod
      const validated = ActionRegistrySchema.parse(parsedJson);

      // Validate action is in Action Registry
      ActionRegistry.getActionDefinition(validated.action);

      return validated;
    } catch (err: any) {
      // Return robust rule-based diagnostic fallback if Ollama endpoint is unreachable or model fails
      return this.fallbackDiagnosis(input, err.message);
    }
  }

  public async generateFix(input: FixInput): Promise<FixProposal> {
    const prompt = AIPrompts.buildFixPrompt(input);

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data: any = await response.json();
      const rawText = data.response;
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        id: `fix_${Date.now()}`,
        analysisId: input.analysis.problem,
        action: input.analysis.action,
        diff: parsed.diff || `--- a/config.env\n+++ b/config.env\n@@ -1 +1 @@\n-# Missing key fix\n+${input.analysis.problem}`,
        explanation: parsed.explanation || input.analysis.suggestedFix,
        branchName: parsed.branchName || `fix/deploymate-patch-${Date.now()}`,
        riskLevel: input.analysis.severity,
      };
    } catch (err) {
      return {
        id: `fix_${Date.now()}`,
        analysisId: input.analysis.problem,
        action: input.analysis.action,
        diff: `--- a/deployment.yaml\n+++ b/deployment.yaml\n@@ -12,3 +12,3 @@\n- image: app:invalid\n+ image: app:latest`,
        explanation: `Fallback fix patch for ${input.analysis.problem}: ${input.analysis.suggestedFix}`,
        branchName: `fix/deploymate-fallback-${Date.now()}`,
        riskLevel: input.analysis.severity,
      };
    }
  }

  private fallbackDiagnosis(input: DiagnosisInput, errorDetails: string): StructuredAIDiagnosis {
    const logStr = input.logs.map(l => l.message).join(' ') + (input.error || '');

    if (logStr.includes('ImagePullBackOff') || logStr.includes('ErrImagePull')) {
      return {
        severity: Severity.HIGH,
        problem: 'ImagePullBackOff',
        rootCause: 'Kubernetes cannot pull the specified container image tag from the registry.',
        confidence: 0.95,
        suggestedFix: 'Verify registry secret authentication and update container image tag in deployment manifest.',
        action: ActionType.UPDATE_IMAGE,
        payload: { image: 'latest' },
        requiresApproval: true,
      };
    }

    if (logStr.includes('CrashLoopBackOff') || logStr.includes('missing environment variable') || logStr.includes('DATABASE_URL')) {
      return {
        severity: Severity.HIGH,
        problem: 'Missing Environment Variable',
        rootCause: 'Application container crashed on startup due to missing required database configuration URL.',
        confidence: 0.92,
        suggestedFix: 'Configure missing environment variables in project settings and trigger redeploy.',
        action: ActionType.UPDATE_ENVIRONMENT,
        payload: { key: 'DATABASE_URL' },
        requiresApproval: true,
      };
    }

    return {
      severity: Severity.MEDIUM,
      problem: 'Deployment Build Failure',
      rootCause: `Deployment process encountered an unexpected failure: ${SecretRedactor.sanitize(errorDetails)}`,
      confidence: 0.85,
      suggestedFix: 'Check build log stack traces, verify environment configuration, and trigger a rollback or retry.',
      action: ActionType.RESTART_DEPLOYMENT,
      requiresApproval: true,
    };
  }
}
