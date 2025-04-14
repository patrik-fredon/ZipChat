# Bezpečnostní Implementace

## Kryptografické mechanismy

### End-to-End Šifrování

```typescript
// src/lib/crypto/e2e.ts
import { subtle } from 'crypto';

export class E2EEncryption {
	private static readonly ALGORITHM = 'AES-GCM';
	private static readonly KEY_LENGTH = 256;

	public static async generateKeyPair(): Promise<CryptoKeyPair> {
		return await subtle.generateKey(
			{
				name: 'ECDH',
				namedCurve: 'P-256'
			},
			true,
			['deriveKey', 'deriveBits']
		);
	}

	public static async encrypt(data: string, publicKey: CryptoKey): Promise<EncryptedData> {
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const key = await this.deriveKey(publicKey);

		const encrypted = await subtle.encrypt(
			{
				name: this.ALGORITHM,
				iv
			},
			key,
			new TextEncoder().encode(data)
		);

		return {
			data: encrypted,
			iv
		};
	}
}
```

### Perfect Forward Secrecy

```typescript
// src/lib/crypto/pfs.ts
export class PFS {
	private static async generateEphemeralKey(): Promise<CryptoKey> {
		return await subtle.generateKey(
			{
				name: 'ECDH',
				namedCurve: 'P-256'
			},
			true,
			['deriveKey']
		);
	}

	public static async establishSession(peerPublicKey: CryptoKey): Promise<SessionKey> {
		const ephemeralKey = await this.generateEphemeralKey();
		const sharedKey = await subtle.deriveKey(
			{
				name: 'ECDH',
				public: peerPublicKey
			},
			ephemeralKey.privateKey,
			{
				name: 'AES-GCM',
				length: 256
			},
			true,
			['encrypt', 'decrypt']
		);

		return {
			key: sharedKey,
			ephemeralPublicKey: ephemeralKey.publicKey
		};
	}
}
```

## Autentizace a Autorizace

### JWT Implementace

```typescript
// src/lib/auth/jwt.ts
import { SignJWT, jwtVerify } from 'jose';

export class JWTService {
	private static readonly secret = new TextEncoder().encode(process.env.JWT_SECRET);

	public static async generateToken(payload: Record<string, unknown>): Promise<string> {
		return await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1h').sign(this.secret);
	}

	public static async verifyToken(token: string): Promise<Record<string, unknown>> {
		const { payload } = await jwtVerify(token, this.secret);
		return payload;
	}
}
```

### Rate Limiting

```typescript
// src/middleware/security.ts
import { Redis } from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const redis = new Redis(process.env.REDIS_URL);
const limiter = new RateLimiterRedis({
	storeClient: redis,
	keyPrefix: 'rate_limit',
	points: 10,
	duration: 60
});

export const rateLimit = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await limiter.consume(req.ip);
		next();
	} catch (error) {
		res.status(429).json({
			error: 'Too many requests'
		});
	}
};
```

## Content Security Policy

### CSP Konfigurace

```typescript
// src/middleware/csp.ts
import helmet from 'helmet';

export const cspMiddleware = helmet.contentSecurityPolicy({
	directives: {
		defaultSrc: ["'self'"],
		scriptSrc: ["'self'", "'unsafe-inline'"],
		styleSrc: ["'self'", "'unsafe-inline'"],
		imgSrc: ["'self'", 'data:', 'https:'],
		connectSrc: ["'self'"],
		fontSrc: ["'self'"],
		objectSrc: ["'none'"],
		mediaSrc: ["'self'"],
		frameSrc: ["'none'"]
	}
});
```

## Bezpečnostní hlavičky

### HTTP Headers

```typescript
// src/middleware/headers.ts
import helmet from 'helmet';

export const securityHeaders = [
	helmet.hsts({
		maxAge: 31536000,
		includeSubDomains: true,
		preload: true
	}),
	helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }),
	helmet.xssFilter(),
	helmet.noSniff(),
	helmet.frameguard({ action: 'deny' })
];
```

## Logování a Monitoring

### Audit Log

```typescript
// src/lib/logger/audit.ts
interface AuditLog {
	timestamp: Date;
	userId?: string;
	ip: string;
	action: string;
	status: 'success' | 'failure';
	metadata: Record<string, unknown>;
}

export class AuditLogger {
	public static async log(log: Omit<AuditLog, 'timestamp'>): Promise<void> {
		await db.collection('audit_logs').insertOne({
			...log,
			timestamp: new Date()
		});
	}
}
```

## Testování bezpečnosti

### Penetrační testy

```typescript
// tests/security/penetration.test.ts
import { SecurityTester } from '../lib/security/tester';

describe('Security Tests', () => {
	it('should prevent SQL injection', async () => {
		const tester = new SecurityTester();
		const result = await tester.testSQLInjection();
		expect(result.vulnerable).toBe(false);
	});

	it('should prevent XSS attacks', async () => {
		const tester = new SecurityTester();
		const result = await tester.testXSS();
		expect(result.vulnerable).toBe(false);
	});
});
```

## Incident Response

### Response Plan

```typescript
// src/lib/security/incident.ts
export class IncidentResponse {
	public static async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
		// 1. Isolate affected systems
		await this.isolateSystems(incident.affectedSystems);

		// 2. Preserve evidence
		await this.preserveEvidence(incident);

		// 3. Notify stakeholders
		await this.notifyStakeholders(incident);

		// 4. Begin recovery
		await this.beginRecovery(incident);
	}
}
```
