import { ActionType, Severity } from '@deploymate/types';

export interface ActionDefinition {
  type: ActionType;
  description: string;
  riskLevel: Severity;
  requiresUserApproval: boolean;
  allowedKeys?: string[];
}

export class ActionRegistry {
  private static ACTIONS: Record<ActionType, ActionDefinition> = {
    [ActionType.UPDATE_IMAGE]: {
      type: ActionType.UPDATE_IMAGE,
      description: 'Updates container image tag in deployment manifest',
      riskLevel: Severity.MEDIUM,
      requiresUserApproval: true,
      allowedKeys: ['image', 'tag', 'containerName'],
    },
    [ActionType.UPDATE_ENVIRONMENT]: {
      type: ActionType.UPDATE_ENVIRONMENT,
      description: 'Adds or updates non-secret application environment variables',
      riskLevel: Severity.MEDIUM,
      requiresUserApproval: true,
      allowedKeys: ['key', 'value'],
    },
    [ActionType.RESTART_DEPLOYMENT]: {
      type: ActionType.RESTART_DEPLOYMENT,
      description: 'Triggers a safe rolling restart of target deployment pods',
      riskLevel: Severity.LOW,
      requiresUserApproval: true,
    },
    [ActionType.ROLLBACK]: {
      type: ActionType.ROLLBACK,
      description: 'Reverts deployment to previous known healthy version',
      riskLevel: Severity.HIGH,
      requiresUserApproval: true,
      allowedKeys: ['targetVersion'],
    },
    [ActionType.UPDATE_REPLICAS]: {
      type: ActionType.UPDATE_REPLICAS,
      description: 'Adjusts pod replica count within safe limits',
      riskLevel: Severity.LOW,
      requiresUserApproval: true,
      allowedKeys: ['replicas'],
    },
    [ActionType.UPDATE_RESOURCES]: {
      type: ActionType.UPDATE_RESOURCES,
      description: 'Adjusts CPU/Memory resource limits and requests',
      riskLevel: Severity.MEDIUM,
      requiresUserApproval: true,
      allowedKeys: ['cpuRequest', 'cpuLimit', 'memoryRequest', 'memoryLimit'],
    },
    [ActionType.UPDATE_DOCKERFILE]: {
      type: ActionType.UPDATE_DOCKERFILE,
      description: 'Proposes Git patch to fix Dockerfile configuration error',
      riskLevel: Severity.HIGH,
      requiresUserApproval: true,
      allowedKeys: ['path', 'diff'],
    },
    [ActionType.UPDATE_DEPENDENCY]: {
      type: ActionType.UPDATE_DEPENDENCY,
      description: 'Proposes package.json/requirements.txt dependency fix patch',
      riskLevel: Severity.HIGH,
      requiresUserApproval: true,
      allowedKeys: ['package', 'version', 'diff'],
    },
  };

  public static isActionAllowed(action: string): boolean {
    return Object.values(ActionType).includes(action as ActionType);
  }

  public static getActionDefinition(action: ActionType): ActionDefinition {
    const def = this.ACTIONS[action];
    if (!def) {
      throw new Error(`Unauthorized action attempted: ${action}`);
    }
    return def;
  }

  public static validateActionPayload(action: ActionType, payload: Record<string, any>): boolean {
    const def = this.getActionDefinition(action);
    if (!def.allowedKeys) return true;

    for (const key of Object.keys(payload)) {
      if (!def.allowedKeys.includes(key)) {
        throw new Error(`Unauthorized payload field '${key}' for action '${action}'`);
      }
    }
    return true;
  }
}
