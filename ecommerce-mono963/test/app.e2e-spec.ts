import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UsersController & AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdUserId: string;

  const testUser = {
    name: 'MonoTest',
    email: 'monotest@example.com',
    password: '123456',
    phone: 123456789,
    country: 'AR',
    address: 'Fake Street',
    city: 'Buenos Aires',
  };

  interface SignupResponse {
    id: string;
    email: string;
  }

  interface SigninResponse {
    access_token: string;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  it('POST /auth/signup → 201 crea un usuario', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser);

    const body = res.body as SignupResponse;

    expect(res.status).toBe(201);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email', testUser.email);

    createdUserId = body.id;
  });

  it('POST /auth/signin → 201 retorna JWT', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer()).post('/auth/signin').send({
      email: testUser.email,
      password: testUser.password,
    });

    const body = res.body as SigninResponse;

    expect(res.status).toBe(201);
    expect(body).toHaveProperty('access_token');

    accessToken = `Bearer ${body.access_token}`;
  });

  it('GET /users/:id → 200 si el usuario existe', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .get(`/users/${createdUserId}`)
      .set('Authorization', accessToken);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', createdUserId);
  });

  it('PUT /users/:id → 200 al actualizar', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .put(`/users/${createdUserId}`)
      .set('Authorization', accessToken)
      .send({ name: 'MonoActualizado' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'MonoActualizado');
  });

  it('DELETE /users/:id → 200 al eliminar', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .set('Authorization', accessToken);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: createdUserId });
  });

  afterAll(async () => {
    await app.close();
  });
});
