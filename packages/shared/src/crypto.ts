import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 10000;

export class EncryptionService {
  private static getKey(masterSecret: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(masterSecret, salt, ITERATIONS, KEY_LENGTH, 'sha512');
  }

  public static encrypt(text: string, secretKey: string): string {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = this.getKey(secretKey, salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Format: salt:iv:tag:encrypted (Base64 encoded)
    return [
      salt.toString('hex'),
      iv.toString('hex'),
      tag.toString('hex'),
      encrypted.toString('hex')
    ].join(':');
  }

  public static decrypt(encryptedHex: string, secretKey: string): string {
    if (!encryptedHex || !encryptedHex.includes(':')) return encryptedHex;
    const parts = encryptedHex.split(':');
    if (parts.length !== 4) return encryptedHex;

    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const encryptedText = Buffer.from(parts[3], 'hex');

    const key = this.getKey(secretKey, salt);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString('utf8');
  }
}

/**
 * Secret Redaction Utility to ensure zero credentials are sent to AI or written to logs
 */
export class SecretRedactor {
  private static SECRET_PATTERNS = [
    /ghp_[a-zA-Z0-9]{30,40}/g,                            // GitHub Personal Access Token
    /gho_[a-zA-Z0-9]{30,40}/g,                            // GitHub OAuth Token
    /github_pat_[a-zA-Z0-9_]{82}/g,                   // GitHub Fine-grained PAT
    /eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g, // JWT Tokens
    /(postgres|postgresql|mongodb|mysql|redis):\/\/[^:\s]+:[^@\s]+@[^\s]+/gi, // Database URIs with passwords
    /bearer\s+[a-zA-Z0-9_\-\.]{15,}/gi,                // Bearer tokens
    /(api[_-]?key|secret|password|token|private[_-]?key)\s*[:=]\s*["']?([^"'\s]+)["']?/gi, // Key-value secrets
  ];

  public static sanitize(text: string): string {
    if (!text) return text;
    let sanitized = text;

    for (const pattern of this.SECRET_PATTERNS) {
      sanitized = sanitized.replace(pattern, (match, p1) => {
        if (p1) {
          return `${p1}="[REDACTED]"`;
        }
        return '[REDACTED_SECRET]';
      });
    }

    return sanitized;
  }
}
