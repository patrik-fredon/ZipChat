# ZipChat

Secure messaging application with end-to-end encryption.

## Features

- End-to-end encryption for messages
- Real-time messaging with WebSocket
- File attachments
- Message drafts
- Typing indicators
- Message status tracking (sent, delivered, read)
- User online status
- Notifications:
  - In-app notifications
  - Email notifications
  - Push notifications (Android, iOS, Web)
  - Notification preferences
  - Quiet hours
  - Notification analytics:
    - Detailed metrics and statistics
    - Real-time tracking of delivery and engagement rates
    - Performance monitoring and optimization
    - Device and platform-specific analytics
    - Date range filtering and pagination support
    - Real-time analytics dashboard
    - User interaction pattern analysis
    - Success rate tracking
    - Data retention policies
    - Security enhancements
    - Error handling
    - Czech localization
    - Data export functionality
    - Data visualization
    - Platform-specific analytics
    - Template analytics
    - Preference analytics
    - Testing analytics
    - Data aggregation
    - Metrics calculation
    - Reporting functionality
    - Performance tracking
    - Security monitoring
    - Error tracking
    - Test coverage tracking
    - Data management
- User authentication:
  - JWT-based authentication
  - Two-factor authentication
  - Email verification
  - Password reset
- Security features:
  - Secure message storage
  - Message expiration
  - Rate limiting
  - Input validation
  - Secure file upload
  - XSS protection
- Database:
  - MongoDB for messages and notifications
  - PostgreSQL for users and keys
- Frontend:
  - React with TypeScript
  - Tailwind CSS for styling
  - Responsive design
  - Accessibility improvements
  - Czech localization
- Testing:
  - Unit tests
  - Integration tests
  - End-to-end tests
- Documentation:
  - API documentation
  - Architecture documentation
  - Security documentation
  - Deployment documentation

## Tech Stack

### Backend

- Node.js with TypeScript
- Express.js
- WebSocket
- MongoDB
- PostgreSQL
- Firebase Admin SDK (for push notifications)
- JWT for authentication
- Zod for validation
- Winston for logging

### Frontend

- React with TypeScript
- Tailwind CSS
- WebSocket client
- React Query
- React Hook Form
- React I18next
- React Testing Library
- Vitest

## Project Structure

```
zipchat/
├── backend/           # Backend application
│   ├── src/          # Source code
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── config/
│   ├── tests/        # Backend tests
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/         # Frontend application
│   ├── src/         # Source code
│   ├── public/      # Static files
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── package.json      # Root package.json (monorepo)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/zipchat.git
cd zipchat
```

2. Install dependencies:

```bash
npm install
```

### Development

Start both frontend and backend in development mode:

```bash
npm run dev
```

Frontend will be available at http://localhost:3000
Backend will be available at http://localhost:8000

### Building for Production

Build both frontend and backend:

```bash
npm run build
```

### Testing

Run tests for both frontend and backend:

```bash
npm run test
```

### Linting

Run linting for both frontend and backend:

```bash
npm run lint
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Firebase for push notification infrastructure
- MongoDB and PostgreSQL communities
- Open source contributors
