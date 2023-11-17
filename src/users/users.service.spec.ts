import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './users.entity';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from 'src/auth/dto/register.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;
  let testingUserData: RegisterDto;
  let testingUser: User;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockResolvedValue(null),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();
    jest.spyOn(bcrypt, 'hash').mockImplementation((password, rounds) => {
      return 'hashedPassword';
    });

    testingUserData = {
      username: 'testUser',
      email: 'test@example.com',
      password: 'plainPassword',
      firstName: 'test',
      lastName: 'test',
      birthDate: new Date(),
      nationalId: '1234567890',
      phone: '+20700000000',
    };
    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash the password', async () => {
      await service.create(testingUserData);
      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
    });

    it('should save the user', async () => {
      const saveSpy = jest.spyOn(repo, 'save').mockResolvedValue(testingUser);

      const user = await service.create(testingUserData);

      expect(saveSpy).toHaveBeenCalled();
      expect(user).toEqual(testingUser);
    });
  });

  describe('findByUsername', () => {
    it('should call repo.findOne', async () => {
      const findOneSpy = jest.spyOn(repo, 'findOne');
      await service.findByUsername('test');
      expect(findOneSpy).toHaveBeenCalledWith({
        where: { username: 'test' },
      });
    });
    it('should return the user', async () => {
      const findOneSpy = jest.spyOn(repo, 'findOne');
      findOneSpy.mockResolvedValue(testingUser);
      const foundUser = await service.findByUsername('test');
      expect(foundUser).toEqual(testingUser);
    });
  });
  describe('findOneBy', () => {
    it('should call repo.findOne', async () => {
      const findOneSpy = jest.spyOn(repo, 'findOne');
      await service.findOneBy([{ username: 'test' }]);
      expect(findOneSpy).toHaveBeenCalledWith({
        where: [{ username: 'test' }],
      });
    });

    it('should return the user', async () => {
      const findOneSpy = jest.spyOn(repo, 'findOne');
      findOneSpy.mockResolvedValue(testingUser);
      const foundUser = await service.findOneBy([{ username: 'test' }]);
      expect(foundUser).toEqual(testingUser);
    });
  });
});
