import { DiagnosisInput, FixInput } from '@deploymate/types';

export class AIPrompts {
  public static buildDiagnosisPrompt(input: DiagnosisInput): string {
    const logsFormatted = input.logs
      .map(l => `[${l.timestamp}] [${l.step}] [${l.level}] ${l.message}`)
      .join('\n');

    return `
You are DeployMate AI, an expert DevOps and Site Reliability Engineer.
Analyze the following deployment failure and output ONLY valid, strictly-formatted JSON matching the schema below.

SCHEMA REQUIREMENT (JSON ONLY):
{
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "problem": "Brief error title (e.g., ImagePullBackOff, Missing Env Var, Syntax Error)",
  "rootCause": "Detailed technical root cause explanation",
  "confidence": 0.0 to 1.0 (float),
  "suggestedFix": "Clear step-by-step recommendation for the developer",
  "action": "UPDATE_IMAGE" | "UPDATE_ENVIRONMENT" | "RESTART_DEPLOYMENT" | "ROLLBACK" | "UPDATE_REPLICAS" | "UPDATE_RESOURCES" | "UPDATE_DOCKERFILE" | "UPDATE_DEPENDENCY",
  "payload": { ...optional action parameters },
  "requiresApproval": true
}

DEPLOYMENT CONTEXT:
Provider: ${input.provider}
Commit SHA: ${input.commitSha}
Error Message: ${input.error || 'None specified'}
Available Env Variable Keys: ${input.envVarKeys.join(', ') || 'None'}

LOGS (Secrets Redacted):
${logsFormatted || 'No logs recorded.'}

${input.dockerfileContent ? `DOCKERFILE:\n${input.dockerfileContent}\n` : ''}
${input.packageJsonContent ? `PACKAGE.JSON:\n${input.packageJsonContent}\n` : ''}

CRITICAL RULES:
- Output ONLY the JSON object. Do not include markdown blocks, intro, or outro text.
- Do NOT propose raw shell commands or raw kubectl commands.
- Ensure 'requiresApproval' is ALWAYS set to true.
`;
  }

  public static buildFixPrompt(input: FixInput): string {
    return `
You are DeployMate AI Code Fix Generator.
Given the diagnosis below, generate a unified Git diff or patch to resolve the issue.

PROBLEM: ${input.analysis.problem}
ROOT CAUSE: ${input.analysis.rootCause}
RECOMMENDED ACTION: ${input.analysis.action}
TARGET REPOSITORY: ${input.repository}
BRANCH: ${input.branch}

Respond ONLY with valid JSON:
{
  "diff": "Unified diff content starting with --- a/... +++ b/...",
  "explanation": "Clear explanation of changes made in the diff",
  "branchName": "fix/deploymate-auto-fix-${Date.now()}"
}
`;
  }
}
