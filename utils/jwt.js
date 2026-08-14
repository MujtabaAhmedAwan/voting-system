import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'fallback-secret-for-voting-app-1234567890';

/**
 * Signs a payload and returns a JWT-like token.
 */
export function sign(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(`${header}.${payloadStr}`).digest('base64url');
  return `${header}.${payloadStr}.${signature}`;
}

/**
 * Verifies a token and returns the payload if valid. Returns null if invalid.
 */
export function verify(token) {
  try {
    if (!token) return null;
    const [header, payloadStr, signature] = token.split('.');
    if (!header || !payloadStr || !signature) return null;
    
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(`${header}.${payloadStr}`).digest('base64url');
    if (signature === expectedSignature) {
      return JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    }
  } catch (e) {
    return null;
  }
  return null;
}
