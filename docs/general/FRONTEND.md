# Frontend Implementace

## Technologie

- Next.js 14 s App Router
- TypeScript
- TailwindCSS
- ShadcnUI
- SWR pro data fetching
- Zustand pro state management
- Zod pro validaci

## Struktura projektu

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── messages/
│   │   └── settings/
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   └── messages/
├── lib/
│   ├── crypto/
│   ├── api/
│   └── utils/
└── types/
```

## Šifrovací vrstva

### Implementace Web Crypto API

```typescript
// src/lib/crypto/encryption.ts
export class EncryptionService {
	private static async generateKey(): Promise<CryptoKey> {
		return await crypto.subtle.generateKey(
			{
				name: 'AES-GCM',
				length: 256
			},
			true,
			['encrypt', 'decrypt']
		);
	}

	public static async encrypt(data: string): Promise<EncryptedData> {
		const key = await this.generateKey();
		const iv = crypto.getRandomValues(new Uint8Array(12));

		const encrypted = await crypto.subtle.encrypt(
			{
				name: 'AES-GCM',
				iv
			},
			key,
			new TextEncoder().encode(data)
		);

		return {
			data: encrypted,
			iv,
			key
		};
	}
}
```

## Komponenty

### Bezpečný formulář

```typescript
// src/components/forms/SecureForm.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
	message: z.string().min(1).max(1000),
	password: z.string().min(8)
});

export function SecureForm() {
	const form = useForm({
		resolver: zodResolver(formSchema)
	});

	return <Form {...form}>{/* Form implementation */}</Form>;
}
```

## State Management

### Šifrovací stav

```typescript
// src/lib/store/encryption.ts
import { create } from 'zustand';

interface EncryptionState {
	keys: Map<string, CryptoKey>;
	addKey: (id: string, key: CryptoKey) => void;
	removeKey: (id: string) => void;
}

export const useEncryptionStore = create<EncryptionState>((set) => ({
	keys: new Map(),
	addKey: (id, key) => set((state) => ({ keys: new Map(state.keys).set(id, key) })),
	removeKey: (id) =>
		set((state) => {
			const newKeys = new Map(state.keys);
			newKeys.delete(id);
			return { keys: newKeys };
		})
}));
```

## API Integrace

### Zabezpečené volání API

```typescript
// src/lib/api/client.ts
import { fetcher } from 'swr';

export const secureFetch = async (url: string, options: RequestInit) => {
	const token = await getAuthToken();

	return fetcher(url, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		}
	});
};
```

## Bezpečnostní opatření

1. **Content Security Policy**

```typescript
// next.config.js
module.exports = {
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'Content-Security-Policy',
						value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
					}
				]
			}
		];
	}
};
```

2. **Rate Limiting**

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	const ip = request.ip ?? '127.0.0.1';
	const limit = 10; // requests
	const window = 60; // seconds

	// Implement rate limiting logic
}
```

## Testování

### Unit testy

```typescript
// src/lib/crypto/__tests__/encryption.test.ts
import { EncryptionService } from '../encryption';

describe('EncryptionService', () => {
	it('should encrypt and decrypt data correctly', async () => {
		const data = 'test message';
		const encrypted = await EncryptionService.encrypt(data);
		const decrypted = await EncryptionService.decrypt(encrypted);

		expect(decrypted).toBe(data);
	});
});
```

## Deployment

### Build konfigurace

```typescript
// next.config.js
module.exports = {
	output: 'standalone',
	poweredByHeader: false,
	compress: true,
	reactStrictMode: true,
	swcMinify: true
};
```
