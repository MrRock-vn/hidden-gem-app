import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Hidden Gem API (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let userId: string;
  let placeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth Endpoints', () => {
    it('POST /auth/register - should register new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          authToken = res.body.access_token;
          userId = res.body.user.id;
        });
    });

    it('POST /auth/login - should login user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });
  });

  describe('Places Endpoints', () => {
    it('GET /places - should get all places', () => {
      return request(app.getHttpServer())
        .get('/places')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
        });
    });

    it('POST /places - should create new place', () => {
      return request(app.getHttpServer())
        .post('/places')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Cafe',
          description: 'Great coffee place',
          category: 'cafe',
          latitude: 21.0285,
          longitude: 105.8542,
          address: 'Hanoi, Vietnam',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          placeId = res.body.id;
        });
    });

    it('GET /places/:id - should get place by id', () => {
      return request(app.getHttpServer())
        .get(`/places/${placeId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(placeId);
        });
    });
  });

  describe('Search Endpoints', () => {
    it('GET /search - should search places', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'cafe' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    });

    it('GET /search - should search with location filter', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({
          lat: 21.0285,
          lng: 105.8542,
          radius: 5000,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  describe('Comments Endpoints', () => {
    let commentId: string;

    it('POST /places/:id/comments - should create comment', () => {
      return request(app.getHttpServer())
        .post(`/places/${placeId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Great place!',
          mentioned_usernames: [],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          commentId = res.body.id;
        });
    });

    it('GET /places/:id/comments - should get comments', () => {
      return request(app.getHttpServer())
        .get(`/places/${placeId}/comments`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  describe('Users Endpoints', () => {
    it('GET /users/me - should get current user', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
        });
    });

    it('POST /users/me/device-token - should register device token', () => {
      return request(app.getHttpServer())
        .post('/users/me/device-token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          device_token: 'test_device_token_12345',
        })
        .expect(200);
    });
  });

  describe('Error Handling', () => {
    it('GET /places/:id - should return 404 for non-existent place', () => {
      return request(app.getHttpServer())
        .get('/places/nonexistent')
        .expect(404);
    });

    it('POST /auth/login - should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('GET /users/me - should return 401 without auth token', () => {
      return request(app.getHttpServer()).get('/users/me').expect(401);
    });
  });
});
