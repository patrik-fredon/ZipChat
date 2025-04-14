# Backend Documentation

## Project Structure

```
backend/
├── src/
│   ├── api/          # API endpoints and routes
│   ├── config/       # Configuration files
│   ├── controllers/  # Request handlers
│   ├── lib/          # Shared libraries
│   ├── middleware/   # Express middleware
│   ├── models/       # Database models
│   ├── routes/       # Route definitions
│   ├── services/     # Business logic
│   ├── utils/        # Utility functions
│   └── index.ts      # Application entry point
├── tests/            # Test files
└── package.json      # Dependencies and scripts
```

## Key Components

### Models

- User model with TypeScript interfaces and validation
- Key model for encryption key management

### Services

- Authentication service
- Encryption service
- Message service

### Middleware

- Authentication middleware
- Error handling middleware
- Request validation middleware

### API Endpoints

- User management endpoints
- Message endpoints
- Key management endpoints

## Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write comprehensive JSDoc comments

### Testing

- Unit tests for all components
- Integration tests for API endpoints
- E2E tests for critical flows

### Security

- Input validation
- Rate limiting
- CORS configuration
- Secure headers

## Deployment

### Requirements

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/zipchat
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

### Build Process

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the application
npm run build

# Start the server
npm start
```

## Monitoring

### Logging

- Winston logger for structured logging
- Error tracking with Sentry
- Performance monitoring with New Relic

### Metrics

- Request/response times
- Error rates
- Resource usage

## API Documentation

Detailed API documentation is available in the `docs/API.md` file.

## Security Considerations

See `docs/SECURITY.md` for detailed security documentation.
