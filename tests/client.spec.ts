import request from 'supertest';
import app from '../src/app';
import UserService from '../src/services/user.service';
import mongoose from 'mongoose';


jest.mock('../src/services/user.service');

jest.mock('../src/auth/authorize', () => ({
  authorize: () => (req: any, res: any, next: any) => next(),
}));

jest.mock('../src/observability/otel.ts', () => ({
  getTracer: () => ({
    startActiveSpan: (name: string, fn: Function) => {
      return fn({
        end: jest.fn(),
        setAttribute: jest.fn(),
        setStatus: jest.fn(),
      });
    },
  }),
}));

const mockUserRaw = {
  _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85'),
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  birth_date: '1990-01-01',
  auth_id: 'auth123',
  is_validated: true,
  created_at: new Date(),
};

const mockUser = {
  ...mockUserRaw,
  toObject: () => ({ ...mockUserRaw }),
};

describe('UserController (/api/v1/clients)', () => {
  const baseUrl = '/api/v1/clients';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/clients', () => {
    it('should create a new user', async () => {
      (UserService.prototype.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (UserService.prototype.getUserByAuthId as jest.Mock).mockResolvedValue(null);
      (UserService.prototype.createUser as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app).post(baseUrl).send({
        email: mockUser.email,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        birth_date: mockUser.birth_date,
        auth_id: mockUser.auth_id,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.attributes.email).toBe(mockUser.email);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post(baseUrl).send({});
      expect(res.status).toBe(400);
    });

    it('should return 409 if email already exists', async () => {
      (UserService.prototype.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app).post(baseUrl).send({
        email: mockUser.email,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        birth_date: mockUser.birth_date,
        auth_id: mockUser.auth_id,
      });

      expect(res.status).toBe(409);
    });

    it('should return 409 if auth_id already exists', async () => {
      (UserService.prototype.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (UserService.prototype.getUserByAuthId as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app).post(baseUrl).send({
        email: mockUser.email,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        birth_date: mockUser.birth_date,
        auth_id: mockUser.auth_id,
      });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/v1/clients/:auth_id', () => {
    it('should return user by auth_id', async () => {
      (UserService.prototype.getUserByAuthId as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app).get(`${baseUrl}/${mockUser.auth_id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.attributes.auth_id).toBe(mockUser.auth_id);
    });

    it('should return 404 if user not found', async () => {
      (UserService.prototype.getUserByAuthId as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get(`${baseUrl}/notfound`);
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/clients/:auth_id', () => {
    it('should update user info', async () => {
      (UserService.prototype.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (UserService.prototype.updateUser as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .patch(`${baseUrl}/${mockUser.auth_id}`)
        .send({ first_name: 'Updated' });

      expect(res.status).toBe(201);
      expect(res.body.data.attributes.first_name).toBe('Test');
    });

    it('should not allow email already in use', async () => {
      (UserService.prototype.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .patch(`${baseUrl}/${mockUser.auth_id}`)
        .send({ email: mockUser.email });

      expect(res.status).toBe(409);
    });

    it('should reject auth_id modification', async () => {
      const res = await request(app)
        .patch(`${baseUrl}/${mockUser.auth_id}`)
        .send({ auth_id: 'newid' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/clients/:auth_id', () => {
    it('should delete user', async () => {
      (UserService.prototype.deleteUser as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app).delete(`${baseUrl}/${mockUser.auth_id}`);
      expect(res.status).toBe(204);
    });

    it('should return 404 if user not found', async () => {
      (UserService.prototype.deleteUser as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete(`${baseUrl}/notfound`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/clients', () => {
    it('should return paginated users', async () => {
      (UserService.prototype.getAllUsers as jest.Mock).mockResolvedValue({
        users: [mockUser],
        total: 1,
        page: 1,
        total_pages: 1
      });

      const res = await request(app).get(`${baseUrl}?page=1&limit=1`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('POST /api/v1/clients/mb/orders', () => {
    it('should publish a RabbitMQ message', async () => {
      const res = await request(app)
        .post(`${baseUrl}/mb/orders?exchangeName=test-ex&exchangeType=direct`)
        .send({ clientId: 'abc789', productId: 'prod123' });

      expect(res.status).toBe(200);
    });

    it('should return 400 if query params are missing', async () => {
      const res = await request(app)
        .post(`${baseUrl}/mb/orders`)
        .send({ clientId: 'abc789' });

      expect(res.status).toBe(400);
    });
  });
});