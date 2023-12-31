import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountPinDto } from './dto/change-pin.dto';
import { SubmitTransactionDto } from './dto/submit-transaction.dto';
import { TransactionType } from './transactions.entity';
import { User } from 'src/users/users.entity';

describe('AccountsController', () => {
  let controller: AccountsController;
  let service: AccountsService;
  let req: {
    user: User;
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: AccountsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            changeAccountPin: jest.fn(),
            submitTransaction: jest.fn(),
            getAccountTransactions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
    service = module.get<AccountsService>(AccountsService);
    const user = new User();
    user.id = 1;
    user.username = 'test';
    user.mfaSecret = 'dasdsd';
    req = {
      user,
    };
  });

  describe('create', () => {
    it('should call accountsService.create with correct params', async () => {
      const createSpy = jest.spyOn(service, 'create');
      const dto: CreateAccountDto = {
        alias: 'test',
        pin: '1234',
        pinConfirmation: '1234',
      };

      await controller.create(dto, req);

      expect(createSpy).toHaveBeenCalledWith({
        ...dto,
        userId: req.user.id,
      });
    });
  });

  // Add tests for other methods

  describe('findAll', () => {
    it('should call accountsService.findAll with correct userId', async () => {
      const findAllSpy = jest.spyOn(service, 'findAll');

      await controller.findAll(req);

      expect(findAllSpy).toHaveBeenCalledWith(req.user.id);
    });
  });
  describe('findOne', () => {
    it('should call accountsService.findOne with correct params', async () => {
      const findOneSpy = jest.spyOn(service, 'findOne');

      await controller.findOne('123', req);

      expect(findOneSpy).toHaveBeenCalledWith({
        accountUuid: '123',
        userId: req.user.id,
      });
    });
  });

  describe('update', () => {
    it('should call accountsService.changeAccountPin with correct params', async () => {
      const updateSpy = jest.spyOn(service, 'changeAccountPin');

      const dto: UpdateAccountPinDto = {
        newPin: '5678',
        newPinConfirmation: '5678',
        pin: '1234',
      };

      await controller.update('123', dto, req);

      expect(updateSpy).toHaveBeenCalledWith({
        ...dto,
        userId: req.user.id,
        accountNumber: '123',
      });
    });
  });
  describe('submitTransaction', () => {
    it('should call submitTransaction on service', async () => {
      const submitTransactionSpy = jest.spyOn(service, 'submitTransaction');

      const payload: SubmitTransactionDto = {
        amount: 100,
        transactionType: TransactionType.DEPOSIT,
        notes: 'Test',
        pin: '1234',
        otp: '123456',
      };

      await controller.submitTransaction(payload, req, '123');

      expect(submitTransactionSpy).toHaveBeenCalledWith({
        user: req.user,
        accountNumber: '123',
        ...payload,
      });
    });
  });

  describe('getAccountTransactions', () => {
    it('should call getAccountTransactions on service', async () => {
      const spy = jest.spyOn(service, 'getAccountTransactions');

      await controller.getAccountTransactions('123', req);

      expect(spy).toHaveBeenCalledWith({
        accountUuid: '123',
        userId: req.user.id,
      });
    });
  });
});
