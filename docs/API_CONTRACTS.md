# API Contracts Documentation

## Response Envelope

All API endpoints follow a standardized response envelope:

```typescript
{
  "message": string | string[],  // Success/error message(s)
  "data": T                       // Response payload (type varies by endpoint)
}
```

## Error Responses

Errors follow NestJS standard format with additional details:

```typescript
{
  "statusCode": number,
  "message": string | string[],
  "error": string
}
```

Common HTTP status codes:
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data/validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., email already exists)
- `500 Internal Server Error`: Server error

## Authentication Endpoints

### POST /api/auth/register

Register a new user (coach or surfer). When registering as a coach, automatically creates a school and sets the user as headCoach.

**Request Body:**
```typescript
{
  "name": string,                    // Required
  "email": string,                   // Required, valid email
  "password": string,                // Required, min 6 characters
  "role": "COACH" | "SURFER",       // Required, case-insensitive (backend normalizes to uppercase)
  "profilePictureUrl"?: string,      // Optional
  "birthdate"?: string,              // Optional
  "document"?: string                // Optional
}
```

**Response (201 Created):**
```typescript
{
  "message": "User created successfully",
  "data": {
    "access_token": string,
    "user": {
      "id": string,
      "name": string,
      "email": string,
      "role": "COACH" | "SURFER",
      "profilePictureUrl"?: string,
      "birthdate"?: string,
      "document"?: string,
      "currentActiveSchoolId"?: string,
      "schools": [
        {
          "id": string,
          "name": string,
          "role": "HEADCOACH" | "COACH" | "SURFER",
          "status": "PENDING" | "ACTIVE" | "BLOCKED"
        }
      ]
    }
  }
}
```

**Notes:**
- For COACH role: a school is automatically created with name "{name}'s School", and the user becomes headCoach with ACTIVE status
- For SURFER role: schools array will be empty until they join a school
- The `access_token` is a JWT that should be included in subsequent requests as `Authorization: Bearer {token}`

---

### POST /api/auth/login

Authenticate an existing user.

**Request Body:**
```typescript
{
  "email": string,      // Required, valid email
  "password": string    // Required, min 6 characters
}
```

**Response (200 OK):**
```typescript
{
  "message": "User logged in successfully",
  "data": {
    "access_token": string,
    "user": {
      "id": string,
      "name": string,
      "email": string,
      "role": "COACH" | "SURFER",
      "profilePictureUrl"?: string,
      "birthdate"?: string,
      "document"?: string,
      "currentActiveSchoolId"?: string,
      "schools": [
        {
          "id": string,
          "name": string,
          "role": "HEADCOACH" | "COACH" | "SURFER",
          "status": "PENDING" | "ACTIVE" | "BLOCKED"
        }
      ]
    }
  }
}
```

**Error Responses:**
- `409 Conflict`: "Email or password is incorrect"

---

### GET /api/auth/me

Get authenticated user information. Requires valid JWT token.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```typescript
{
  "message": "User fetched successfully",
  "data": {
    "id": string,
    "name": string,
    "email": string,
    "role": "COACH" | "SURFER",
    "profilePictureUrl"?: string,
    "birthdate"?: string,
    "document"?: string,
    "currentActiveSchoolId"?: string,
    "schools": [
      {
        "id": string,
        "name": string,
        "role": "HEADCOACH" | "COACH" | "SURFER",
        "status": "PENDING" | "ACTIVE" | "BLOCKED"
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token, or user no longer exists

**Notes:**
- This endpoint validates the token and ensures the user still exists in the database
- If the user has been deleted or the token is invalid for any reason, returns 401
- The app should call this endpoint on boot (when online) to validate cached sessions

---

## User Roles and School Memberships

### User Roles
- `COACH`: Can create their own school (becomes headCoach) and can be invited as a coach (teacher) to other schools
- `SURFER`: Cannot create schools, must be invited to join schools

### Membership Roles
- `HEADCOACH`: Administrator of the school (full permissions)
- `COACH`: Teacher at the school (limited permissions, cannot manage other coaches or school settings)
- `SURFER`: Athlete/student at the school

### Membership Status
- `PENDING`: User requested to join or was invited, but not yet approved by headCoach
- `ACTIVE`: Membership approved, user can access all features and is counted in operations
- `BLOCKED`: Previously active, but blocked by headCoach; cannot access features or participate

---

## JWT Token Structure

The JWT access token contains the following claims:

```typescript
{
  "id": string,                      // User ID
  "email": string,                   // User email
  "currentActiveSchoolId"?: string,  // Currently selected school (if any)
  "iat": number,                     // Issued at (timestamp)
  "exp": number                      // Expiration (timestamp)
}
```

**Token Expiration:**
- MVP: No refresh token; when access_token expires, user must login again
- Expiration requires online connection to re-authenticate
- Offline operations work while token is valid

---

## Multi-tenancy

The API implements multi-tenancy using `schoolId` as the tenant boundary:

- Most domain operations (training-session, athlete, finance) require a valid `schoolId` context
- Authorization is enforced at the guard/policy level based on user's membership status in the school
- Users can be members of multiple schools with different roles and statuses
- Only `ACTIVE` memberships grant access to school operations

---

## Future Endpoints (Planned)

### Identity Domain
- `PATCH /api/identity/me` - Update user profile (profilePictureUrl, birthdate, document)

### School Domain
- `GET /api/schools/:schoolId` - Get school details
- `PATCH /api/schools/:schoolId` - Update school (headCoach only)
- `GET /api/schools/:schoolId/members` - List school members
- `POST /api/schools/:schoolId/members/:userId/approve` - Approve pending member
- `PATCH /api/schools/:schoolId/members/:userId/block` - Block/unblock member
- `POST /api/schools/join` - Join school via invite link/code

### Sync Domain
- `POST /api/sync/commands` - Submit batch of offline commands for idempotent replay
- `GET /api/sync/status` - Get sync status and conflicts
