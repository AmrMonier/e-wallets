import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptions, FindOptionsWhere, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: RegisterDto): Promise<User> {
    const newUser = this.usersRepository.create(userData);

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
