import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from './../users/users.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let user: User;

  beforeEach(async () => {
    // Mock UsersService and JwtService
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    user = new User();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user if valid username and password is provided', async () => {
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementationOnce(() => new Promise((res) => res(true)));
      const result = await authService.validateUser('username', 'password');
      expect(result).toEqual(user);
    });
    it('should return null if wrong username provided', async () => {
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(null);
      const result = await authService.validateUser('username', 'password');
      expect(result).toEqual(null);
    });

    it('should return null if wrong password provided', async () => {
      user.password = '123456789';
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementationOnce(
          (pass, hashed) => new Promise((res) => res(false)),
        );
      const result = await authService.validateUser('username', 'password');
      expect(result).toEqual(null);
    });
  });

  describe('login', () => {
    it('should return user and tokens on valid login', async () => {
      const loginDto: LoginDto = {
        username: 'test',
        password: 'password123',
      };
      user.username = 'test';
      user.id = 1;
      jest.spyOn(authService, 'validateUser').mockResolvedValue(user);
      const result = await authService.login(loginDto);

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const loginDto: LoginDto = {
        username: 'invalid',
        password: 'invalid',
      };
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should return a new access token if refresh token is valid', async () => {
      // mock valid token and user lookup
      jest
        .spyOn(jwtService, 'verify')
        .mockImplementationOnce(() => ({ username: 'test', id: 1 }));
      jest.spyOn(usersService, 'findByUsername').mockResolvedValueOnce(user);
      const accessToken = await authService.refreshAccessToken('refresh-token');

      expect(accessToken).toEqual({
        accessToken: 'token',
      });
    });

    it('should throw an error for an invalid refresh token', async () => {
      // mock invalid token
      jest.spyOn(jwtService, 'verify').mockImplementationOnce(() => {
        throw new Error('Invalid Token');
      });
      await expect(
        authService.refreshAccessToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register user with valid payload', async () => {
      const payload: RegisterDto = {
        username: 'test',
        password: '1234',
        email: 'test@test.com',
        birthDate: new Date(),
        firstName: 'Test',
        lastName: 'Test',
        middleName: 'Test',
        nationalId: '1234567890',
        phone: '+20123456789',
      };
      user.username = payload.username;
      user.id = 1;
      jest.spyOn(usersService, 'findOneBy').mockResolvedValueOnce(null);
      jest.spyOn(usersService, 'create').mockResolvedValueOnce(user);
      const result = await authService.register(payload);

      expect(result.user.username).toEqual(payload.username);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error if user already exists', async () => {
      const payload: RegisterDto = {
        username: 'test',
        password: '1234',
        email: 'test@test.com',
        birthDate: new Date(),
        firstName: 'Test',
        lastName: 'Test',
        middleName: 'Test',
        nationalId: '1234567890',
        phone: '+20123456789',
      };
      jest.spyOn(usersService, 'findOneBy').mockResolvedValueOnce(user);
      await expect(authService.register(payload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
