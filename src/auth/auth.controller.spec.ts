import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
            refreshAccessToken: jest.fn(),
            userService: {
              findOneBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });
  describe('register', () => {
    const registerDto: RegisterDto = {
      birthDate: new Date(),
      email: 'test@example.com',
      firstName: 'test',
      lastName: 'test',
      middleName: 'test',
      nationalId: '1234567890',
      password: 'password',
      phone: '+20700000000',
      username: 'testUser',
    };
    it('should register a new user', async () => {
      await controller.register(registerDto);
      expect(authService.register).toBeCalledWith(registerDto);
    });

    // it('should throw an error if the username is already taken', async () => {
    //   await controller.register(registerDto);
    //   await expect(controller.register(registerDto)).rejects.toThrow(
    //     BadRequestException,
    //   );
    // });
  });
  it('should login an existing user', async () => {
    const loginDto: LoginDto = {
      password: 'PASSWORD',
      username: 'validUsername',
    };

    await controller.login(loginDto);

    expect(authService.login).toBeCalledWith(loginDto);
  });

  it('should refresh the access token', async () => {
    const refreshToken = 'validRefreshToken';
    const result = await controller.refresh({ refreshToken });
    expect(authService.refreshAccessToken).toBeCalledWith(refreshToken);
  });
});
