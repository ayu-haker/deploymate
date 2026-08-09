import { ActionRegistry } from '../action-registry';
import { ActionType } from '@deploymate/types';

describe('ActionRegistry Security Enforcement', () => {
  it('should allow valid whitelist actions', () => {
    expect(ActionRegistry.isActionAllowed(ActionType.UPDATE_IMAGE)).toBe(true);
    expect(ActionRegistry.isActionAllowed(ActionType.UPDATE_ENVIRONMENT)).toBe(true);
    expect(ActionRegistry.isActionAllowed(ActionType.ROLLBACK)).toBe(true);
  });

  it('should reject arbitrary shell or dangerous actions', () => {
    expect(ActionRegistry.isActionAllowed('SUDO_RM_RF')).toBe(false);
    expect(ActionRegistry.isActionAllowed('KUBECTL_EXEC')).toBe(false);
    expect(ActionRegistry.isActionAllowed('DOCKER_EXEC')).toBe(false);
  });

  it('should throw error when validating unauthorized payload fields', () => {
    expect(() => {
      ActionRegistry.validateActionPayload(ActionType.UPDATE_IMAGE, {
        image: 'nginx:latest',
        maliciousCommand: 'rm -rf /',
      });
    }).toThrow('Unauthorized payload field');
  });
});
