# Multi-Tenancy Authorization Strategy

## Overview

The Surf API implements **multi-tenancy using `schoolId`** as the tenant boundary. Authorization is enforced at multiple levels:

1. **JWT Guard**: Validates authentication token (global, already implemented)
2. **School Context Guard**: Ensures user has active membership in the school being accessed
3. **Role-based Access**: Checks membership role (HEADCOACH, COACH, SURFER) for specific operations

## School Context Authorization

### Decorator: `@RequireSchoolContext()`

Used on endpoints that operate within a school context. Validates that:
- The user is authenticated
- The `schoolId` parameter/body exists
- The user has an `ACTIVE` membership in that school

### Decorator: `@RequireSchoolRole(...roles)`

More restrictive - requires specific roles within the school:
- `HEADCOACH`: Full admin permissions (manage school, approve members, etc.)
- `COACH`: Teacher permissions (manage training sessions, athletes)
- `SURFER`: Student permissions (view own data, participate in sessions)

## Implementation Patterns

### Pattern 1: School-scoped Resource Access

```typescript
@Get('schools/:schoolId/members')
@RequireSchoolContext()
async listMembers(@Param('schoolId') schoolId: string, @CurrentUser() user: AuthUser) {
  // User is guaranteed to have ACTIVE membership in schoolId
  // ...
}
```

### Pattern 2: HeadCoach-only Operations

```typescript
@Patch('schools/:schoolId')
@RequireSchoolRole('HEADCOACH')
async updateSchool(
  @Param('schoolId') schoolId: string,
  @Body() dto: UpdateSchoolDto,
  @CurrentUser() user: AuthUser
) {
  // User is guaranteed to be HEADCOACH of this school
  // ...
}
```

### Pattern 3: Multiple Roles

```typescript
@Post('schools/:schoolId/training-sessions')
@RequireSchoolRole('HEADCOACH', 'COACH')
async createSession(...) {
  // User can be either HEADCOACH or COACH
  // ...
}
```

## Membership Status

Only `ACTIVE` memberships grant access. Other statuses:
- `PENDING`: Awaiting approval - no access to school operations
- `BLOCKED`: Previously active but blocked - no access

## Error Responses

- `401 Unauthorized`: No valid JWT token
- `403 Forbidden`: 
  - User has no membership in the school
  - Membership is not ACTIVE
  - User role doesn't match required roles

## Usage in Modules

### School Module
- HEADCOACH: Create/update school, approve/block members
- COACH: View members, manage own coaching activities
- SURFER: View own membership status

### Training Session Module
- HEADCOACH/COACH: Create sessions, mark attendance, add feedback
- SURFER: View own sessions, check-in

### Athlete Module
- HEADCOACH/COACH: Full CRUD on athlete records
- SURFER: View own athlete profile only

### Finance Module
- HEADCOACH: Full access to payments, billing
- COACH: View only (optional)
- SURFER: View own payment status only

## Implementation Files

- `auth/guards/school-context.guard.ts`: Base guard for school membership validation
- `auth/decorators/require-school-context.decorator.ts`: Decorator for school access
- `auth/decorators/require-school-role.decorator.ts`: Decorator for role-based access
- `common/types/school-context.types.ts`: Types for school authorization context
