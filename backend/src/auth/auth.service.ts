import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // Initialize Google OAuth client
    const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
    if (googleClientId) {
      this.googleClient = new OAuth2Client(googleClientId);
    }
  }

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email đã được sử dụng');
      }
      throw new ConflictException('Username đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Tài khoản này sử dụng đăng nhập bằng mạng xã hội',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const tokens = await this.generateTokens(user);

    // Save refresh token
    await this.usersRepository.update(user.id, {
      refresh_token: tokens.refreshToken,
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async googleAuth(token: string) {
    try {
      if (!this.googleClient) {
        throw new BadRequestException('Google OAuth not configured');
      }

      // Verify Google ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new BadRequestException('Invalid Google token');
      }

      const { sub: googleId, email, name, picture } = payload;

      // Find or create user
      let user = await this.usersRepository.findOne({
        where: { google_id: googleId as string },
      });

      if (!user) {
        // Check if email already exists
        const existingUser = await this.usersRepository.findOne({
          where: { email: email as string },
        });

        if (existingUser) {
          // Link Google account to existing user
          existingUser.google_id = googleId as string;
          user = await this.usersRepository.save(existingUser);
        } else {
          // Create new user
          user = this.usersRepository.create({
            email: email as string,
            username:
              (name as string) || email?.split('@')[0] || 'user_' + Date.now(),
            google_id: googleId as string,
            avatar_url: (picture as string) || undefined,
          });
          user = await this.usersRepository.save(user);
        }
      }

      const tokens = await this.generateTokens(user);
      await this.usersRepository.update(user.id, {
        refresh_token: tokens.refreshToken,
      });

      return {
        user: this.sanitizeUser(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.error('Google auth error:', error);
      throw new BadRequestException('Google authentication failed');
    }
  }

  async appleAuth(token: string) {
    void token;
    throw new BadRequestException(
      'Apple authentication is disabled until server-side token verification is implemented',
    );
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub, refresh_token: refreshToken },
      });

      if (!user) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const tokens = await this.generateTokens(user);
      await this.usersRepository.update(user.id, {
        refresh_token: tokens.refreshToken,
      });

      return tokens;
    } catch {
      throw new UnauthorizedException('Token hết hạn hoặc không hợp lệ');
    }
  }

  async logout(userId: string) {
    await this.usersRepository.update(userId, {
      refresh_token: null as any,
    });
    return { message: 'Đăng xuất thành công' };
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { password, refresh_token, google_id, apple_id, ...sanitized } = user;
    return sanitized;
  }
}
