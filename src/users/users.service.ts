import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from '../auth/dto/register.dto';
import { User } from './users.entity';
import * as Speakeasy from 'speakeasy';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: RegisterDto): Promise<User> {
    const secret = Speakeasy.generateSecret({ length: 20 });
    const newUser = this.usersRepository.create({
      ...userData,
      mfaSecret: secret.hex,
    });

    newUser.password = await bcrypt.hash(userData.password, 10);
    return this.usersRepository.save(newUser);
  }
  async findByUsername(username: string) {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findOneBy(findOptions: FindOptionsWhere<User>[]) {
    return this.usersRepository.findOne({ where: findOptions });
  }
}
