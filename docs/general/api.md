# API Documentation

## Analytics Endpoints

### GET /api/analytics/notifications/user/{userId}
- Returns detailed analytics data for a specific user's notifications
- Query Parameters:
  - `page`: Page number for pagination
  - `limit`: Number of items per page
  - `startDate`: Start date for filtering (optional)
  - `endDate`: End date for filtering (optional)
- Response:
  ```json
  {
    "data": [
      {
        "id": "string",
        "deliveryStatus": "string",
        "deliveryTime": "string",
        "engagementStatus": "string",
        "engagementTime": "string",
        "platform": "string",
        "deliveryTimeSeconds": number,
        "deviceInfo": {
          "platform": "string",
          "osVersion": "string",
          "appVersion": "string"
        },
        "performanceMetrics": {
          "deliveryTimeMs": number,
          "processingTimeMs": number,
          "retryCount": number
        }
      }
    ],
    "total": number,
    "page": number,
    "limit": number
  }
  ```

### GET /api/analytics/notifications/metrics
- Returns aggregated metrics for notifications
- Query Parameters:
  - `startDate`: Start date for filtering (optional)
  - `endDate`: End date for filtering (optional)
- Response:
  ```json
  {
    "deliveryRate": number,
    "engagementRate": number,
    "averageDeliveryTime": number,
    "totalNotifications": number,
    "platformStats": {
      "web": number,
      "mobile": number
    },
    "successRate": number,
    "userInteractionPatterns": {
      "averageResponseTime": number,
      "mostActiveHours": string[],
      "preferredPlatform": string
    },
    "performanceMetrics": {
      "averageProcessingTime": number,
      "maxRetryCount": number,
      "successRate": number
    },
    "deviceStats": {
      "android": number,
      "ios": number,
      "web": number
    },
    "templateStats": {
      "mostUsed": string,
      "successRate": number,
      "engagementRate": number
    },
    "preferenceStats": {
      "enabledNotifications": number,
      "disabledNotifications": number,
      "quietHoursEnabled": number
    }
  }
  ```

### GET /api/analytics/notifications/export
- Exports analytics data in CSV format
- Query Parameters:
  - `startDate`: Start date for filtering (optional)
  - `endDate`: End date for filtering (optional)
  - `format`: Export format (CSV, JSON)
- Response: CSV or JSON file with analytics data

### GET /api/analytics/notifications/dashboard
- Returns real-time dashboard data
- Query Parameters:
  - `refreshInterval`: Data refresh interval in seconds (optional)
- Response:
  ```json
  {
    "currentStats": {
      "notificationsSent": number,
      "deliveryRate": number,
      "engagementRate": number,
      "averageDeliveryTime": number
    },
    "hourlyStats": {
      "time": string,
      "count": number,
      "deliveryRate": number,
      "engagementRate": number
    }[],
    "platformStats": {
      "web": number,
      "mobile": number
    },
    "deviceStats": {
      "android": number,
      "ios": number,
      "web": number
    },
    "errorStats": {
      "deliveryErrors": number,
      "processingErrors": number,
      "retryCount": number
    }
  }
  ```

### GET /api/analytics/notifications/patterns
- Returns user interaction patterns
- Query Parameters:
  - `userId`: User ID (optional)
  - `startDate`: Start date for filtering (optional)
  - `endDate`: End date for filtering (optional)
- Response:
  ```json
  {
    "averageResponseTime": number,
    "mostActiveHours": string[],
    "preferredPlatform": string,
    "notificationPreferences": {
      "enabledTypes": string[],
      "quietHours": {
        "start": string,
        "end": string
      }
    },
    "engagementPatterns": {
      "clickRate": number,
      "openRate": number,
      "ignoreRate": number
    }
  }
  ```

### GET /api/analytics/notifications/security
- Returns security-related analytics
- Query Parameters:
  - `startDate`: Start date for filtering (optional)
  - `endDate`: End date for filtering (optional)
- Response:
  ```json
  {
    "failedAttempts": number,
    "suspiciousActivities": number,
    "tokenRevocations": number,
    "rateLimitHits": number,
    "securityAlerts": {
      "type": string,
      "count": number,
      "severity": string
    }[]
  }
  ```

### GET /api/analytics/notifications/performance
- Returns performance metrics
- Query Parameters:
  - `startDate`: Start date for filtering (optional)
  - `endDate`: End date for filtering (optional)
- Response:
  ```json
  {
    "averageProcessingTime": number,
    "maxRetryCount": number,
    "successRate": number,
    "deliveryTimeDistribution": {
      "lessThan1s": number,
      "1sTo5s": number,
      "5sTo10s": number,
      "moreThan10s": number
    },
    "platformPerformance": {
      "web": {
        "averageDeliveryTime": number,
        "successRate": number
      },
      "android": {
        "averageDeliveryTime": number,
        "successRate": number
      },
      "ios": {
        "averageDeliveryTime": number,
        "successRate": number
      }
    }
  }
  ``` 