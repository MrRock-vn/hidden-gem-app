import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

/**
 * Auth Endpoints
 */
export const ApiRegister = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Register new user',
      description: 'Create a new account with email and password',
    }),
    ApiResponse({
      status: 201,
      description: 'User registered successfully',
      schema: {
        example: {
          id: 'uuid',
          email: 'user@example.com',
          username: 'username',
          access_token: 'jwt_token',
          refresh_token: 'refresh_token',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input or email already exists',
    }),
  );

export const ApiLogin = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Login user',
      description: 'Authenticate with email and password',
    }),
    ApiResponse({
      status: 200,
      description: 'Login successful',
      schema: {
        example: {
          access_token: 'jwt_token',
          refresh_token: 'refresh_token',
          user: { id: 'uuid', email: 'user@example.com' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid credentials',
    }),
  );

export const ApiGoogleAuth = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Authenticate with Google',
      description: 'Login or register using Google OAuth token',
    }),
    ApiResponse({
      status: 200,
      description: 'Authentication successful',
      schema: {
        example: {
          access_token: 'jwt_token',
          user: { id: 'uuid', email: 'user@gmail.com' },
        },
      },
    }),
  );

/**
 * User Endpoints
 */
export const ApiGetCurrentUser = () =>
  applyDecorators(
    ApiBearerAuth('access_token'),
    ApiOperation({
      summary: 'Get current user',
      description: 'Retrieve profile of authenticated user',
    }),
    ApiResponse({
      status: 200,
      description: 'User profile retrieved',
      schema: {
        example: {
          id: 'uuid',
          username: 'username',
          email: 'user@example.com',
          avatar_url: 'https://...',
          bio: 'User bio',
          follower_count: 10,
          following_count: 5,
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );

export const ApiUpdateProfile = () =>
  applyDecorators(
    ApiBearerAuth('access_token'),
    ApiOperation({
      summary: 'Update user profile',
      description: 'Update user information like bio, avatar',
    }),
    ApiResponse({
      status: 200,
      description: 'Profile updated successfully',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );

export const ApiRegisterDeviceToken = () =>
  applyDecorators(
    ApiBearerAuth('access_token'),
    ApiOperation({
      summary: 'Register push notification token',
      description: 'Store device token for receiving push notifications',
    }),
    ApiResponse({
      status: 200,
      description: 'Device token registered',
    }),
  );

/**
 * Places Endpoints
 */
export const ApiGetAllPlaces = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all places',
      description: 'Retrieve paginated list of places',
    }),
    ApiQuery({ name: 'page', type: Number, required: false, example: 1 }),
    ApiQuery({ name: 'limit', type: Number, required: false, example: 10 }),
    ApiResponse({
      status: 200,
      description: 'Places retrieved successfully',
      schema: {
        example: {
          data: [
            {
              id: 'uuid',
              title: 'Cafe Name',
              latitude: 21.0285,
              longitude: 105.8542,
            },
          ],
          meta: { page: 1, limit: 10, total: 100, totalPages: 10 },
        },
      },
    }),
  );

export const ApiCreatePlace = () =>
  applyDecorators(
    ApiBearerAuth('access_token'),
    ApiOperation({
      summary: 'Create new place',
      description: 'Create a new place with location and details',
    }),
    ApiResponse({
      status: 201,
      description: 'Place created successfully',
      schema: {
        example: {
          id: 'uuid',
          title: 'Cafe Name',
          description: 'Description',
          latitude: 21.0285,
          longitude: 105.8542,
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Validation error',
    }),
  );

export const ApiGetPlace = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get place by ID',
      description: 'Retrieve single place with full details',
    }),
    ApiParam({ name: 'id', type: String, description: 'Place ID' }),
    ApiResponse({
      status: 200,
      description: 'Place retrieved',
    }),
    ApiResponse({
      status: 404,
      description: 'Place not found',
    }),
  );

export const ApiUpdatePlace = () =>
  applyDecorators(
    ApiBearerAuth('access_token'),
    ApiOperation({
      summary: 'Update place',
      description: 'Update place details (owner only)',
    }),
    ApiParam({ name: 'id', type: String }),
    ApiResponse({ status: 200, description: 'Place updated' }),
    ApiResponse({ status: 403, description: 'Not authorized' }),
  );

export const ApiDeletePlace = () =>
  applyDecorators(
    ApiBearerAuth('access_token'),
    ApiOperation({
      summary: 'Delete place',
      description: 'Delete a place (owner only)',
    }),
    ApiParam({ name: 'id', type: String }),
    ApiResponse({ status: 200, description: 'Place deleted' }),
    ApiResponse({ status: 403, description: 'Not authorized' }),
  );

/**
 * Search Endpoints
 */
export const ApiSearch = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Search places',
      description: 'Full-text and geo-spatial search',
    }),
    ApiQuery({
      name: 'q',
      type: String,
      required: false,
      description: 'Search query',
    }),
    ApiQuery({
      name: 'category',
      type: String,
      required: false,
      description: 'Filter by category',
    }),
    ApiQuery({
      name: 'lat',
      type: Number,
      required: false,
      description: 'Latitude for location search',
    }),
    ApiQuery({
      name: 'lng',
      type: Number,
      required: false,
      description: 'Longitude for location search',
    }),
    ApiQuery({
      name: 'radius',
      type: Number,
      required: false,
      description: 'Search radius in meters',
    }),
    ApiResponse({
      status: 200,
      description: 'Search results',
      schema: {
        example: {
          data: [
            {
              id: 'uuid',
              title: 'Result',
              distance: 1500,
            },
          ],
          meta: { total: 50 },
        },
      },
    }),
  );

/**
 * Comments Endpoints
 */
export const ApiGetComments = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get place comments',
      description: 'Retrieve comments and replies for a place',
    }),
    ApiParam({ name: 'placeId', type: String }),
    ApiQuery({ name: 'page', type: Number, required: false }),
    ApiResponse({
      status: 200,
      description: 'Comments retrieved',
    }),
  );

export const ApiCreateComment = () =>
  applyDecorators(
    ApiBearerAuth('access_token'),
    ApiOperation({
      summary: 'Create comment',
      description: 'Add a comment to a place with optional mentions',
    }),
    ApiParam({ name: 'placeId', type: String }),
    ApiResponse({
      status: 201,
      description: 'Comment created',
      schema: {
        example: {
          id: 'uuid',
          content: 'Great place!',
          user: { username: 'user1' },
          created_at: '2024-01-01T00:00:00Z',
        },
      },
    }),
  );

/**
 * Social Endpoints
 */
export const ApiFollowUser = () =>
  applyDecorators(
    ApiBearerAuth('access_token'),
    ApiOperation({
      summary: 'Follow user',
      description: 'Follow another user',
    }),
    ApiParam({ name: 'userId', type: String }),
    ApiResponse({ status: 200, description: 'User followed' }),
    ApiResponse({ status: 409, description: 'Already following' }),
  );

export const ApiGetFollowers = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get user followers',
      description: 'List all followers of a user',
    }),
    ApiParam({ name: 'userId', type: String }),
    ApiQuery({ name: 'page', type: Number, required: false }),
    ApiResponse({
      status: 200,
      description: 'Followers list',
      schema: {
        example: {
          data: [
            {
              id: 'uuid',
              username: 'follower1',
              avatar_url: 'https://...',
            },
          ],
          meta: { total: 10 },
        },
      },
    }),
  );

export const ApiLikePlace = () =>
  applyDecorators(
    ApiBearerAuth('access_token'),
    ApiOperation({
      summary: 'Like/Unlike place',
      description: 'Toggle like on a place',
    }),
    ApiParam({ name: 'placeId', type: String }),
    ApiResponse({
      status: 200,
      description: 'Like toggled',
      schema: {
        example: {
          is_liked: true,
          like_count: 42,
        },
      },
    }),
  );

/**
 * Notifications Endpoints
 */
export const ApiGetNotifications = () =>
  applyDecorators(
    ApiBearerAuth('access_token'),
    ApiOperation({
      summary: 'Get notifications',
      description: 'Retrieve notification history',
    }),
    ApiQuery({ name: 'page', type: Number, required: false }),
    ApiQuery({
      name: 'filter',
      type: String,
      enum: ['all', 'mention', 'like', 'comment', 'follow'],
      required: false,
    }),
    ApiResponse({
      status: 200,
      description: 'Notifications retrieved',
      schema: {
        example: {
          data: [
            {
              id: 'uuid',
              type: 'mention',
              title: '@user mentioned you',
              read: false,
              created_at: '2024-01-01T00:00:00Z',
            },
          ],
          meta: { total: 20 },
        },
      },
    }),
  );

export const ApiMarkNotificationRead = () =>
  applyDecorators(
    ApiBearerAuth('access_token'),
    ApiOperation({
      summary: 'Mark notification as read',
      description: 'Update notification read status',
    }),
    ApiParam({ name: 'notificationId', type: String }),
    ApiResponse({ status: 200, description: 'Notification marked' }),
  );
