import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiExtraModels, getSchemaPath, ApiBearerAuth } from '@nestjs/swagger';

import { LoginDto } from '@/auth/dtos/login.dto';
import { RegisterDto } from '@/auth/dtos/register.dto';
import { AuthResponseDto } from '@/auth/dtos/auth-response.dto';
import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import { UserResponseDto } from '@/users/dtos/user-response.dto';


export function ApiRegisterDocumentation() {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiBody({ type: RegisterDto }),
    ApiExtraModels(AuthResponseDto, ApiResponseDto),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'User registered successfully',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(AuthResponseDto) },
              message: { type: 'string', example: 'User registered successfully' },
              statusCode: { type: 'number', example: HttpStatus.CREATED }
            }
          }
        ]
      }
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad request',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { oneOf: [
                { type: 'string', example: 'Bad request' },
                { type: 'array', items: { type: 'string' }, example: ['Bad request'] }
              ]},
              error: { type: 'string', example: 'Bad Request' },
              statusCode: { type: 'number', example: HttpStatus.BAD_REQUEST }
            }
          }
        ]
      }
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Email already in use',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'Email already exists' },
              error: { type: 'string', example: 'Conflict' },
              statusCode: { type: 'number', example: HttpStatus.CONFLICT }
            }
          }
        ]
      }
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'Internal server error' },
              error: { type: 'string', example: 'Internal server error' },
              statusCode: { type: 'number', example: HttpStatus.INTERNAL_SERVER_ERROR }
            }
          }
        ]
      }
    }),
  );
}

export function ApiLoginDocumentation() {
  return applyDecorators(
    ApiOperation({ summary: 'Login a user' }),
    ApiBody({ type: LoginDto }),
    ApiExtraModels(AuthResponseDto, ApiResponseDto),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User logged in successfully',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(AuthResponseDto) },
              message: { type: 'string', example: 'User logged in successfully' },
              statusCode: { type: 'number', example: HttpStatus.OK }
            }
          }
        ]
      }
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad request',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { oneOf: [
                { type: 'string', example: 'Bad request' },
                { type: 'array', items: { type: 'string' }, example: ['Bad request'] }
              ]},
              error: { type: 'string', example: 'Bad Request' },
              statusCode: { type: 'number', example: HttpStatus.BAD_REQUEST }
            }
          }
        ]
      }
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid credentials',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'Invalid credentials' },
              error: { type: 'string', example: 'Unauthorized' },
              statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED }
            }
          }
        ]
      }
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'User not found' },
              error: { type: 'string', example: 'Not Found' },
              statusCode: { type: 'number', example: HttpStatus.NOT_FOUND }
            }
          }
        ]
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'Internal server error' },
              error: { type: 'string', example: 'Internal server error' },
              statusCode: { type: 'number', example: HttpStatus.INTERNAL_SERVER_ERROR }
            }
          }
        ]
      }
    }),
  );
}

export function ApiGetLoggedUserDocumentation() {
  return applyDecorators(
    ApiOperation({ summary: 'Get current user profile' }),
    ApiBearerAuth('JWT-auth'),
    ApiExtraModels(UserResponseDto, ApiResponseDto),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Current user profile',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(UserResponseDto) },
              message: { type: 'string', example: 'User profile fetched successfully' },
              statusCode: { type: 'number', example: HttpStatus.OK }
            }
          }
        ]
      }
    }),
    ApiResponse({ 
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'Unauthorized' },
              error: { type: 'string', example: 'Unauthorized' },
              statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED }
            }
          }
        ]
      }
    }),
    ApiResponse({ 
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'User not found' },
              error: { type: 'string', example: 'Not Found' },
              statusCode: { type: 'number', example: HttpStatus.NOT_FOUND }
            }
          }
        ]
      }
    })
  );
}
