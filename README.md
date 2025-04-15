# ZipChat

![ZipChat Logo](frontend/public/logo.png)

Secure messaging application with end-to-end encryption, built with modern technologies and best practices.

## 🚀 Features

### 📱 Core Features

- **End-to-end encryption** for all messages
- **Real-time messaging** with WebSocket technology
- **File attachments** with secure upload and download
- **Message drafts** with auto-save functionality
- **Typing indicators** showing when others are typing
- **Message status tracking** (sent, delivered, read)
- **User online status** with last seen timestamps

### 🔔 Notification System

- **In-app notifications** with sound and visual alerts
- **Email notifications** for important events
- **Push notifications** for all platforms (Android, iOS, Web)
- **Customizable notification preferences**
- **Quiet hours** for undisturbed periods
- **Notification analytics** with detailed metrics

### 🔒 Security Features

- **JWT-based authentication** with refresh tokens
- **Two-factor authentication** (2FA) support
- **Email verification** for new accounts
- **Password reset** functionality
- **Secure message storage** with encryption
- **Message expiration** options
- **Rate limiting** to prevent abuse
- **Input validation** for all forms
- **XSS protection** implemented
- **CSRF protection** enabled

### 📊 Analytics & Monitoring

- **Real-time analytics dashboard**
- **User interaction pattern analysis**
- **Success rate tracking**
- **Performance monitoring**
- **Error tracking and reporting**
- **Test coverage metrics**
- **Data visualization tools**

### 🌐 Localization

- **Czech language support**
- **English language support**
- **Easy to add new languages**

## 🛠 Tech Stack

### Backend

- **Node.js** (v18+) with **TypeScript**
- **Express.js** for API routing
- **WebSocket** for real-time communication
- **MongoDB** for message and notification storage
- **PostgreSQL** for user data and encryption keys
- **Firebase Admin SDK** for push notifications
- **JWT** for secure authentication
- **Zod** for runtime type checking
- **Winston** for structured logging
- **Jest** for testing

### Frontend

- **React** with **TypeScript**
- **Tailwind CSS** for styling
- **WebSocket client** for real-time updates
- **React Query** for data fetching
- **React Hook Form** for form handling
- **React I18next** for localization
- **Vitest** for testing
- **React Testing Library** for component testing

## 📁 Project Structure

```
zipchat/
├── backend/                 # Backend application
│   ├── src/                # Source code
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Helper functions
│   │   └── config/         # Configuration files
│   ├── tests/              # Backend tests
│   ├── package.json        # Backend dependencies
│   └── tsconfig.json       # TypeScript config
│
├── frontend/               # Frontend application
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # State management
│   │   ├── styles/        # CSS and Tailwind
│   │   └── utils/         # Helper functions
│   ├── public/            # Static files
│   ├── tests/             # Frontend tests
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
│
├── docs/                   # Documentation
├── k8s/                    # Kubernetes configs
└── package.json            # Root package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (v6 or higher)
- **PostgreSQL** (v14 or higher)
- **Git**

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/zipchat.git
   cd zipchat
   ```

2. **Install dependencies**:

   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**:

   ```bash
   # Backend
   cp backend/.env.example backend/.env

   # Frontend
   cp frontend/.env.example frontend/.env
   ```

4. **Update environment variables** in both `.env` files with your configuration.

### Development

1. **Start the backend**:

   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend**:

   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api-docs

### Testing

1. **Run backend tests**:

   ```bash
   cd backend
   npm test
   ```

2. **Run frontend tests**:

   ```bash
   cd frontend
   npm test
   ```

3. **Run all tests**:
   ```bash
   npm test
   ```

### Building for Production

1. **Build the backend**:

   ```bash
   cd backend
   npm run build
   ```

2. **Build the frontend**:

   ```bash
   cd frontend
   npm run build
   ```

3. **Start production server**:
   ```bash
   cd backend
   npm start
   ```

### Docker Deployment

1. **Build Docker images**:

   ```bash
   docker-compose build
   ```

2. **Start containers**:
   ```bash
   docker-compose up -d
   ```

### Kubernetes Deployment

1. **Apply Kubernetes configurations**:
   ```bash
   kubectl apply -f k8s/
   ```

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Architecture Overview](docs/architecture.md)
- [Security Guidelines](docs/security.md)
- [Deployment Guide](docs/deployment.md)
- [Contributing Guide](CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on how to submit pull requests, report bugs, and suggest new features.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for push notification infrastructure
- MongoDB and PostgreSQL communities
- Open source contributors
- All our amazing users and contributors

## 📞 Support

For support, please:

- Open an issue in the GitHub repository
- Join our Discord community
- Contact us at support@zipchat.com

## 📈 Project Status

[![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/zipchat/ci.yml?branch=main)](https://github.com/yourusername/zipchat/actions)
[![Code Coverage](https://img.shields.io/codecov/c/github/yourusername/zipchat)](https://codecov.io/gh/yourusername/zipchat)
[![License](https://img.shields.io/github/license/yourusername/zipchat)](https://github.com/yourusername/zipchat/blob/main/LICENSE)
[![Version](https://img.shields.io/github/v/release/yourusername/zipchat)](https://github.com/yourusername/zipchat/releases)
