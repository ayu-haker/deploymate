import { EncryptionService, SecretRedactor } from '../crypto';

describe('EncryptionService & SecretRedactor', () => {
  const secretKey = '0123456789abcdef0123456789abcdef';

  it('should correctly encrypt and decrypt text using AES-256-GCM', () => {
    const originalText = 'github_pat_1234567890secret_access_token';
    const encrypted = EncryptionService.encrypt(originalText, secretKey);

    expect(encrypted).not.toBe(originalText);
    expect(encrypted).toContain(':');

    const decrypted = EncryptionService.decrypt(encrypted, secretKey);
    expect(decrypted).toBe(originalText);
  });

  it('should redact sensitive tokens and passwords before logging or sending to AI', () => {
    const rawLog = 'Connecting with postgres://admin:supersecretpassword@localhost:5432/db and ghp_1234567890abcdef1234567890abcdef';
    const sanitized = SecretRedactor.sanitize(rawLog);

    expect(sanitized).not.toContain('supersecretpassword');
    expect(sanitized).not.toContain('ghp_1234567890abcdef1234567890abcdef');
    expect(sanitized).toContain('[REDACTED]');
  });
});
