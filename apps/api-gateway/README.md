# Finance Manager API Gateway

This API Gateway serves as the entry point for the Finance Manager microservices architecture. It routes requests to the appropriate microservices and provides a unified Swagger documentation.

## Features

- **Centralized API Documentation**: Comprehensive Swagger documentation for all endpoints
- **Authentication**: Routes for user registration, login, and token refresh
- **User Management**: Profile management for authenticated users
- **Accounts Management**: Full CRUD operations for financial accounts

## API Documentation

The API documentation is available at `/api` when the service is running. It provides:

- Detailed endpoint descriptions
- Request/response examples
- Authentication requirements
- Schema definitions for all DTOs

## Available Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token

### Users

- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update user profile
- `POST /users/me/change-password` - Change user password

### Accounts

- `POST /accounts` - Create a new account
- `GET /accounts` - Get all user accounts
- `GET /accounts/:id` - Get account by ID
- `GET /accounts/:id/balance` - Get account balance
- `GET /accounts/total-balance` - Get total balance across all accounts
- `PATCH /accounts/:id` - Update account
- `PATCH /accounts/:id/reconcile` - Reconcile account
- `DELETE /accounts/:id` - Remove account

## Running the API Gateway

```bash
# Start the service
npm run start

# Start in development mode
npm run start:dev
```

## Environment Variables

The API Gateway requires the following environment variables:

- `PORT` - Port to run the API Gateway on (default: 3000)
- `RABBITMQ_URI` - URI for RabbitMQ connection (default: amqp://localhost:5672)

## Microservices Architecture

This API Gateway communicates with the following microservices:

- **Auth Service**: Handles authentication and authorization
- **Users Service**: Manages user profiles and information
- **Accounts Service**: Manages financial accounts and balances

Communication between the API Gateway and microservices is done via RabbitMQ message queues.
