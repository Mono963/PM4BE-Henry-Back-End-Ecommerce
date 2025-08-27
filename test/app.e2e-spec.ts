import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('UsersController & AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdUserId: string;

  const testUser = {
    name: 'MonoTestt',
    email: 'monotest@examplee.com',
    password: 'MiC0ntra$eña',
    confirmPassword: 'MiC0ntra$eña',
    phone: 1234567810,
    country: 'Argentina',
    address: 'Fake Street',
    city: 'Buenos Aires',
  };

  interface SignupResponse {
    id: string;
    email: string;
  }

  interface SigninResponse {
    accessToken: string;
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

    const dataSource = app.get(DataSource);

    // 🧨 Orden correcto de borrado según dependencias
    await dataSource.query(
      `DELETE FROM "products_order_details_order_details"`,
    );
    await dataSource.query(`DELETE FROM "order_details_products_products"`); // si existe
    await dataSource.query(`DELETE FROM "orders"`);
    await dataSource.query(`DELETE FROM "order_details"`);
    await dataSource.query(`DELETE FROM "files"`);
    await dataSource.query(`DELETE FROM "products"`);
    await dataSource.query(`DELETE FROM "categories"`);
    await dataSource.query(`DELETE FROM "users"`);
  });

  it('POST /auth/signup → 201 crea un usuario', async () => {
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
    const res = await request(app.getHttpServer()).post('/auth/signin').send({
      email: testUser.email,
      password: testUser.password,
    });

    const body = res.body as SigninResponse;

    expect(res.status).toBe(201);
    expect(body).toHaveProperty('accessToken'); // 🛠️ propiedad corregida

    accessToken = `Bearer ${body.accessToken}`;
  });

  it('GET /users/:id → 200 si el usuario existe', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${createdUserId}`)
      .set('Authorization', accessToken);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', createdUserId);
  });

  it('PUT /users/:id → 200 al actualizar', async () => {
    const res = await request(app.getHttpServer())
      .put(`/users/${createdUserId}`)
      .set('Authorization', accessToken)
      .send({ name: 'MonoActualizado' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'MonoActualizado');
  });

  it('DELETE /users/:id → 200 al eliminar', async () => {
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
