# Authentication Implementation Guide

This document provides comprehensive information about the authentication system in this expense-tracker-backend project for use by other agents or developers.

## Overview

The project uses **JWT (JSON Web Token) based authentication** with NestJS, Passport, and bcrypt for password hashing. All protected routes require a valid JWT token in the Authorization header.

## Architecture

### Components

1. **AuthModule** (`src/auth/auth.module.ts`) - Main authentication module
2. **AuthService** (`src/auth/auth.service.ts`) - Business logic for registration and login
3. **AuthController** (`src/auth/auth.controller.ts`) - HTTP endpoints
4. **JwtStrategy** (`src/auth/strategies/jwt.strategy.ts`) - Token validation strategy
5. **JwtAuthGuard** (`src/auth/guards/jwt-auth.guard.ts`) - Route protection guard
6. **DTOs** (`src/auth/models/`) - Input validation models

## API Endpoints

### Public Endpoints (No Authentication Required)

#### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation:**
- `email`: Must be a valid email format, required
- `password`: Must be a string, minimum 8 characters, required

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

**Status Codes:**
- `201`: User successfully registered
- `400`: Bad request (validation failed)
- `409`: User with this email already exists

#### POST `/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same format as register

**Status Codes:**
- `200`: User successfully logged in
- `401`: Invalid credentials
- `400`: Bad request (validation failed)

### Protected Endpoints (Authentication Required)

#### GET `/auth/test`
Test endpoint to verify authentication is working.

**Headers Required:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "message": "Auth is working correctly"
}
```

**Status Codes:**
- `200`: Authentication successful
- `401`: Unauthorized (missing or invalid token)

## Protected Routes in Other Modules

The following controllers use `@UseGuards(JwtAuthGuard)` at the controller level, meaning **all routes** in these controllers require authentication:

1. **CategoriesController** (`src/categories/categories.controller.ts`)
   - All CRUD operations require authentication
   - User ID is extracted from `req.user.id`

2. **TransactionsController** (`src/transactions/transactions.controller.ts`)
   - All transaction creation and balance queries require authentication
   - User ID is extracted from `req.user.id`

3. **SavingsGoalsController** (`src/savings-goals/savings-goals.controller.ts`)
   - All savings goals operations require authentication
   - User ID is extracted from `req.user.id`

## How to Use Authentication in Controllers

### Protecting a Route

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from '@nestjs/common';

@Controller('example')
export class ExampleController {
  @Get('protected')
  @UseGuards(JwtAuthGuard)  // Add this decorator
  @ApiBearerAuth('JWT-auth')  // For Swagger documentation
  async protectedRoute(
    @Request() req: { user: { id: string; email: string } }
  ) {
    // Access authenticated user info via req.user
    const userId = req.user.id;
    const userEmail = req.user.email;
    // ... your logic
  }
}
```

### Protecting an Entire Controller

```typescript
@Controller('example')
@UseGuards(JwtAuthGuard)  // All routes in this controller are protected
@ApiBearerAuth('JWT-auth')
export class ExampleController {
  // All methods here require authentication
}
```

### Accessing User Information

After authentication, the user object is available in the request:

```typescript
@Request() req: { user: { id: string; email: string } }
```

The `req.user` object contains:
- `id`: User's unique identifier (string)
- `email`: User's email address (string)

## Authentication Flow

### Registration Flow
1. Client sends POST `/auth/register` with email and password
2. AuthService checks if email already exists
3. Password is hashed using bcrypt (10 rounds)
4. User is saved to database with hashed password
5. JWT token is generated with user ID and email
6. Token and user info are returned to client

### Login Flow
1. Client sends POST `/auth/login` with email and password
2. AuthService finds user by email
3. Password is compared with stored hash using bcrypt.compare()
4. If valid, JWT token is generated
5. Token and user info are returned to client

### Protected Route Access Flow
1. Client sends request with `Authorization: Bearer <token>` header
2. JwtAuthGuard intercepts the request
3. JwtStrategy extracts token from Authorization header
4. JwtStrategy validates token signature and expiration
5. JwtStrategy.validate() checks if user still exists in database
6. If valid, user object is attached to request as `req.user`
7. Request proceeds to controller handler

## Security Features

### Password Security
- **Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
- **Never stored in plain text**: Only password hashes are stored in database
- **One-way function**: Hashes cannot be reversed to get original password

### Token Security
- **Signed tokens**: JWT tokens are signed with a secret key (JWT_SECRET)
- **Expiration**: Tokens expire after a set time (default: 1 day, configurable via JWT_EXPIRES_IN)
- **Bearer token format**: Tokens must be sent as `Authorization: Bearer <token>`
- **User validation**: On each request, the system verifies the user still exists

### Error Handling
- Generic error messages: "Invalid credentials" (doesn't reveal if email exists)
- Proper HTTP status codes (401 for unauthorized, 409 for conflicts)

## Environment Variables

Required environment variables:

```env
# JWT Configuration (REQUIRED)
JWT_SECRET=your-super-secret-key-here-make-it-long-and-random
JWT_EXPIRES_IN=1d  # Optional, defaults to 1d if not set

# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

**Important:**
- `JWT_SECRET` must be set or the application will throw an error on startup
- Use a long, random string for JWT_SECRET (minimum 32 characters recommended)
- Never commit JWT_SECRET to version control

## Dependencies

Key packages used for authentication:

- `@nestjs/jwt` - JWT token generation and validation
- `@nestjs/passport` - Authentication framework
- `passport-jwt` - JWT strategy for Passport
- `bcrypt` - Password hashing
- `class-validator` - Input validation (used in DTOs)

## File Structure

```
src/auth/
├── auth.module.ts              # Module configuration
├── auth.service.ts             # Business logic (register, login)
├── auth.controller.ts          # HTTP endpoints
├── guards/
│   └── jwt-auth.guard.ts      # Route protection guard
├── strategies/
│   └── jwt.strategy.ts        # JWT validation strategy
└── models/
    ├── register.dto.ts        # Registration input validation
    ├── login.dto.ts           # Login input validation
    └── auth-response.type.ts  # Response type definition
```

## Testing Authentication

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

**Access Protected Route:**
```bash
curl -X GET http://localhost:3000/auth/test \
  -H "Authorization: Bearer <your-token-here>"
```

### Using the Test Endpoint

The `/auth/test` endpoint is useful for verifying:
- Token is valid
- Token hasn't expired
- User still exists in database
- Authentication flow is working correctly

## Common Patterns

### Pattern 1: User-Scoped Resources
Most resources in this app are user-scoped. Services receive `userId` as the first parameter:

```typescript
// In controller
async create(@Request() req, @Body() dto) {
  return this.service.create(req.user.id, dto);
}

// In service
async create(userId: string, dto: CreateDto) {
  // Create resource associated with userId
}
```

### Pattern 2: Controller-Level Protection
Most controllers protect all routes at the controller level:

```typescript
@Controller('resource')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ResourceController {
  // All routes automatically protected
}
```

## Important Notes

1. **Token Storage**: The frontend/client is responsible for storing and sending the JWT token. The backend does not manage token storage.

2. **Token Expiration**: When a token expires, the user must login again to get a new token. There is no refresh token mechanism currently implemented.

3. **User Context**: After authentication, always use `req.user.id` to identify the user. Never trust user IDs from request body or query parameters.

4. **Password Requirements**: Minimum 8 characters. No other complexity requirements are enforced.

5. **Email Uniqueness**: Email addresses must be unique. Registration will fail if email already exists.

## Integration with Other Modules

The `AuthService` is exported from `AuthModule` and can be imported by other modules if needed:

```typescript
@Module({
  imports: [AuthModule],  // Import AuthModule
  // ...
})
export class OtherModule {
  // Can now inject AuthService if needed
}
```

However, for most use cases, you only need to use `JwtAuthGuard` to protect routes and access `req.user` in your controllers.

## Troubleshooting

### Common Issues

1. **401 Unauthorized on protected routes**
   - Check that token is sent in `Authorization: Bearer <token>` header
   - Verify token hasn't expired
   - Ensure JWT_SECRET matches between token generation and validation

2. **"JWT_SECRET is not defined" error**
   - Ensure JWT_SECRET is set in environment variables
   - Check .env file is loaded correctly

3. **"Invalid credentials" on login**
   - Verify email exists in database
   - Check password is correct
   - Ensure password was hashed correctly during registration

4. **Token validation fails**
   - Check user still exists in database (JwtStrategy validates user existence)
   - Verify token signature matches JWT_SECRET
   - Check token expiration time

## Additional Resources

- Detailed explanation: See `src/auth/AUTH_EXPLANATION.md` for a comprehensive beginner-friendly guide
- NestJS JWT documentation: https://docs.nestjs.com/security/authentication
- Passport JWT strategy: http://www.passportjs.org/packages/passport-jwt/

