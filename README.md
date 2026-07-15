# Store Management API - Microservices Architecture

A backend system built with **NestJS + TypeScript** using a microservice architecture.

The project is designed with independent services communicating through **RabbitMQ** and exposed through an **API Gateway**.

---

## Architecture Overview

```
                    Client
                      |
                      |
                API Gateway
              (HTTP REST API)
                      |
        --------------------------------
        |              |               |
        v              v               v

   Auth Service   User Service    Product Service
        |
        |
        | RabbitMQ Events
        |
        v

     Email Service
        |
        |
       SMTP
```

---

# Technologies

- Node.js
- NestJS
- TypeScript
- RabbitMQ
- MongoDB
- JWT Authentication
- Docker
- Yarn
- Nodemailer

---

# Services

## API Gateway

**Responsibility:**

- Entry point for clients
- Handles HTTP requests
- Routes requests to internal services
- Authentication guards
- API documentation (Swagger)

Communication:

```
HTTP
 |
 v
Microservices
```

---

## Auth Service

**Responsibility:**

- User authentication
- Login/Register
- JWT generation
- Password hashing
- Account verification
- Authentication events

Database:

```
Auth Database
```

RabbitMQ events:

Publishes:

```
EMAIL_VERIFY_ACCOUNT
EMAIL_WELCOME_USER
EMAIL_RESET_PASSWORD
```

Example:

```ts
rabbitClient.emit('email.verify_account', {
  email,
  name,
  code,
});
```

---

## User Service

**Responsibility:**

- User profile management
- Customer information
- User related operations

Database:

```
User Database
```

---

## Email Service

**Responsibility:**

- Sending emails
- Email templates
- SMTP communication

The service does not receive HTTP requests.

It only consumes RabbitMQ events.

Example:

```
RabbitMQ
    |
    |
EMAIL_VERIFY_ACCOUNT
    |
    v
Email Consumer
    |
    v
Email Service
    |
    v
SMTP Server
```

---

# Communication Between Services

The project uses RabbitMQ for asynchronous communication.

Example:

User registration:

```
1. Client
      |
      v

2. API Gateway

      |
      v

3. Auth Service

      |
      |
      | publish event
      |
      v

4. RabbitMQ

      |
      v

5. Email Service

      |
      v

6. Send verification email
```

---

# RabbitMQ Events

Shared event names:

```typescript
EMAIL_WELCOME_USER;

EMAIL_VERIFY_ACCOUNT;

EMAIL_RESET_PASSWORD;
```

Example payload:

```json
{
  "email": "user@test.com",
  "name": "Ali",
  "code": "123456"
}
```

---

# Project Structure

```
store-management-api/

├── api-gateway/

├── auth-service/

├── user-service/

├── email-service/

├── docker-compose.yml

└── README.md
```

---

# Running The Project

## Requirements

Install:

- Node.js >= 20
- Yarn
- Docker
- RabbitMQ
- MongoDB

---

# Environment Variables

Each service has its own `.env`.

Example:

```
PORT=3000

RABBITMQ_URL=amqp://localhost:5672

MONGO_URI=mongodb://localhost:27017/database

JWT_SECRET=secret
```

---

# Install Dependencies

For each service:

```bash
yarn install
```

Example:

```bash
cd auth-service

yarn install
```

---

# Development Mode

Run each service separately.

## API Gateway

```bash
cd api-gateway

yarn start:dev
```

---

## Auth Service

```bash
cd auth-service

yarn start:dev
```

---

## User Service

```bash
cd user-service

yarn start:dev
```

---

## Email Service

```bash
cd email-service

yarn start:dev
```

---

# Docker Development

Start infrastructure:

```bash
docker compose up -d
```

Services started:

- MongoDB
- RabbitMQ
- Redis (if enabled)

---

# RabbitMQ Management

RabbitMQ dashboard:

```
http://localhost:15672
```

Default:

```
username: guest
password: guest
```

---

# Message Acknowledgement

Consumers acknowledge messages after successful processing.

Example:

```typescript
this.rabbitMQService.ack(context);
```

Meaning:

```
Message processed successfully
Remove message from queue
```

Failed messages:

```typescript
this.rabbitMQService.nack(context);
```

Meaning:

```
Message processing failed
Reject message
```

---

# Database Strategy

Each microservice owns its database.

Example:

```
Auth Service
     |
     v
 Auth Database


User Service
     |
     v
 User Database


Product Service
     |
     v
 Product Database
```

Services do not directly access each other's databases.

---

# Deployment Concept

Each service can be deployed independently.

Example:

```
Server

├── api-gateway container

├── auth-service container

├── user-service container

├── email-service container

├── rabbitmq container

└── mongodb container
```

---

# Future Improvements

- Add Order Service
- Add Product Service
- Add Notification Service
- Add shared package for DTOs/events
- Add Kubernetes deployment
- Add CI/CD pipeline
- Add centralized logging
- Add monitoring

---

# Author

Backend Developer

Node.js / NestJS
