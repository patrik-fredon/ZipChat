# Database Layer

## Architecture

### Components

```
[PostgreSQL] <- [Backend API]
[MongoDB]   <- [Logging/Metrics]
[Redis]     <- [Caching/Session]
```

## PostgreSQL

### Schema

```sql
-- src/models/schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id),
    recipient_id UUID REFERENCES users(id),
    encrypted_content BYTEA NOT NULL,
    iv BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false
);

-- Encryption Keys
CREATE TABLE encryption_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    public_key BYTEA NOT NULL,
    private_key_encrypted BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_encryption_keys_user ON encryption_keys(user_id);
```

### Migrations

```typescript
// src/database/migrations/001_initial.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true
      );
    `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('DROP TABLE users;');
	}
}
```

## MongoDB

### Schema

```typescript
// src/models/mongodb.ts
import { Schema } from 'mongoose';

// Audit logs
const AuditLogSchema = new Schema({
	timestamp: { type: Date, default: Date.now },
	userId: { type: String, required: false },
	ip: { type: String, required: true },
	action: { type: String, required: true },
	resource: { type: String, required: true },
	status: { type: String, enum: ['success', 'failure'], required: true },
	metadata: { type: Schema.Types.Mixed }
});

// Metrics
const MetricSchema = new Schema({
	timestamp: { type: Date, default: Date.now },
	name: { type: String, required: true },
	value: { type: Number, required: true },
	labels: { type: Schema.Types.Mixed }
});

// Cache
const CacheSchema = new Schema({
	key: { type: String, required: true, unique: true },
	value: { type: Schema.Types.Mixed, required: true },
	expiresAt: { type: Date, required: true },
	createdAt: { type: Date, default: Date.now }
});

export const models = {
	AuditLog: mongoose.model('AuditLog', AuditLogSchema),
	Metric: mongoose.model('Metric', MetricSchema),
	Cache: mongoose.model('Cache', CacheSchema)
};
```

## Redis

### Configuration

```typescript
// src/lib/redis/config.ts
import Redis from 'ioredis';

export const redis = new Redis({
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379'),
	password: process.env.REDIS_PASSWORD,
	db: parseInt(process.env.REDIS_DB || '0'),
	retryStrategy: (times) => {
		const delay = Math.min(times * 50, 2000);
		return delay;
	}
});

// Session store
export const sessionStore = new Redis({
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379'),
	password: process.env.REDIS_PASSWORD,
	db: parseInt(process.env.REDIS_SESSION_DB || '1')
});

// Cache store
export const cacheStore = new Redis({
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379'),
	password: process.env.REDIS_PASSWORD,
	db: parseInt(process.env.REDIS_CACHE_DB || '2')
});
```

### Caching

```typescript
// src/lib/redis/cache.ts
export class Cache {
	private static readonly DEFAULT_TTL = 3600; // 1 hour

	public static async get<T>(key: string): Promise<T | null> {
		const data = await cacheStore.get(key);
		return data ? JSON.parse(data) : null;
	}

	public static async set<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): Promise<void> {
		await cacheStore.setex(key, ttl, JSON.stringify(value));
	}

	public static async del(key: string): Promise<void> {
		await cacheStore.del(key);
	}
}
```

## Security

### Data Encryption

```typescript
// src/lib/database/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class DatabaseEncryption {
	private static readonly ALGORITHM = 'aes-256-gcm';
	private static readonly IV_LENGTH = 12;
	private static readonly KEY = Buffer.from(process.env.DB_ENCRYPTION_KEY!, 'hex');

	public static encrypt(data: string): { encrypted: Buffer; iv: Buffer } {
		const iv = randomBytes(this.IV_LENGTH);
		const cipher = createCipheriv(this.ALGORITHM, this.KEY, iv);

		const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);

		return { encrypted, iv };
	}

	public static decrypt(encrypted: Buffer, iv: Buffer): string {
		const decipher = createDecipheriv(this.ALGORITHM, this.KEY, iv);

		return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
	}
}
```

### Backup and Recovery

```typescript
// src/lib/database/backup.ts
export class DatabaseBackup {
	public static async createBackup(): Promise<string> {
		const timestamp = new Date().toISOString();
		const backupDir = `/backup/${timestamp}`;

		// PostgreSQL backup
		await this.backupPostgreSQL(backupDir);

		// MongoDB backup
		await this.backupMongoDB(backupDir);

		// Redis backup
		await this.backupRedis(backupDir);

		return backupDir;
	}

	private static async backupPostgreSQL(dir: string): Promise<void> {
		const command = `pg_dump -U ${process.env.DB_USER} -d ${process.env.DB_NAME} > ${dir}/postgres.sql`;
		await exec(command);
	}

	private static async backupMongoDB(dir: string): Promise<void> {
		const command = `mongodump --out ${dir}/mongodb`;
		await exec(command);
	}

	private static async backupRedis(dir: string): Promise<void> {
		const command = `redis-cli SAVE`;
		await exec(command);
		await fs.copyFile('/var/lib/redis/dump.rdb', `${dir}/redis.rdb`);
	}
}
```

## Performance

### Indexes and Optimization

```sql
-- src/models/indexes.sql
-- Optimization queries
CREATE INDEX idx_messages_composite ON messages(sender_id, recipient_id, created_at);
CREATE INDEX idx_users_composite ON users(username, email, is_active);

-- Cleaning old messages
CREATE FUNCTION cleanup_old_messages() RETURNS void AS $$
BEGIN
  DELETE FROM messages
  WHERE expires_at < NOW()
  AND is_deleted = false;
END;
$$ LANGUAGE plpgsql;

-- Scheduled execution
SELECT cron.schedule('0 0 * * *', 'SELECT cleanup_old_messages()');
```

### Connection Pooling

```typescript
// src/lib/database/pool.ts
import { Pool } from 'pg';

export const pool = new Pool({
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT || '5432'),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000
});
```
