import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load environment variables from .env file', () => {
    expect(service['ENV_CONFIG']).toBeDefined();
    expect(service['ENV_CONFIG'].PORT).toBeDefined();
  });

  it('should initialize config variables', () => {
    expect(service.PORT).toBeDefined();
    expect(service.DATABASE_NAME).toBeDefined();
  });

  it('should generate typeOrmConfig', () => {
    expect(service.typeOrmConfig).toEqual({
      type: 'postgres',
      host: service.DATABASE_HOST,
      port: +service.DATABASE_PORT,
      username: service.DATABASE_USER,
      password: service.DATABASE_PASSWORD,
      database: service.DATABASE_NAME,
      // ...other config
    });
  });
});
