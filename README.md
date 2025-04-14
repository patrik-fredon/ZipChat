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

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- PostgreSQL
- Firebase project (for push notifications)

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

3. Create environment files:
```bash
cp .env.example .env
```

4. Update environment variables in `.env`:
- Set up database connections
- Configure JWT secret
- Set up Firebase credentials
- Configure email settings
- Set up other required variables

5. Initialize Firebase:
- Create a Firebase project
- Download service account key
- Set up FCM (Firebase Cloud Messaging)
- Configure VAPID keys for web push notifications

6. Start the development server:
```bash
npm run dev
```

## Testing

Run tests:
```bash
npm test
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Security Considerations

- All messages are encrypted end-to-end
- Secure password storage with bcrypt
- JWT token expiration
- Rate limiting for API endpoints
- Input validation with Zod
- Secure file upload handling
- XSS protection
- Proper error handling
- Secure logging
- Regular security audits

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Firebase for push notification infrastructure
- MongoDB and PostgreSQL communities
- Open source contributors 