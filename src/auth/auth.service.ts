import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/users.entity';

import * as QRCode from 'qrcode';
import * as Speakeasy from 'speakeasy';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) return user;
    return null;
  }

  async register(payload: RegisterDto) {
    let user: User;
    user = await this.usersService.findOneBy([
      { username: payload.username },
      { email: payload.email },
      { nationalId: payload.nationalId },
      { phone: payload.phone },
    ]);
    if (user) {
      throw new BadRequestException('User already exists');
    }

    user = await this.usersService.create({
      ...payload,
    });
    const otpauthUrl = Speakeasy.otpauthURL({
      secret: user.mfaSecret,
      label: `E-Wallets:${user.email}`,
      issuer: 'E-Wallets',
      encoding: 'hex',
    });
    const qrCodeImage = await QRCode.toDataURL(otpauthUrl);

    return {
      user,
      refreshToken: this.generateRefreshToken(user),
      accessToken: this.generateAccessToken(user),
      authenticatorQRCode: qrCodeImage,
    };
  }

  async login({ username, password }: LoginDto) {
    const user = await this.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      user,
      refreshToken: this.generateRefreshToken(user),
      accessToken: this.generateAccessToken(user),
    };
  }

  async refreshAccessToken(refreshToken: string) {
    let payload: { username: string; id: number };
    try {
      payload = this.jwtService.verify<{ username: string; id: number }>(
        refreshToken,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.usersService.findByUsername(payload.username);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      accessToken: this.generateAccessToken(user),
    };
  }

  private generateAccessToken(user: User) {
    return this.jwtService.sign({ username: user.username, id: user.id });
  }

  private generateRefreshToken(user: User) {
    return this.jwtService.sign(
      { username: user.username, id: user.id },
      { expiresIn: '120m' },
    );
  }
}
