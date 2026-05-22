import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { MediaService } from '../media/media.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mediaService: MediaService,
  ) {}

  // All 'me/*' routes MUST come before ':id' to avoid :id='me' matching

  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId, userId);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(userId, updateUserDto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Không có file ảnh');
    }

    // Process avatar: optimize + upload to S3/local
    const avatarUrl = await this.mediaService.processAvatar(file);
    return this.usersService.updateAvatar(userId, avatarUrl);
  }

  @Get('me/settings')
  async getSettings(@CurrentUser('id') userId: string) {
    return this.usersService.getSettings(userId);
  }

  @Patch('me/settings')
  async updateSettings(
    @CurrentUser('id') userId: string,
    @Body()
    settings: {
      is_private?: boolean;
      push_notifications?: boolean;
      dark_mode?: boolean;
    },
  ) {
    return this.usersService.updateSettings(userId, settings);
  }

  @Get('me/blocks')
  async getBlockedList(@CurrentUser('id') userId: string) {
    return this.usersService.getBlockedUsers(userId);
  }

  @Patch('me/email')
  async updateEmail(
    @CurrentUser('id') userId: string,
    @Body('email') email: string,
  ) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Email khong hop le');
    }
    return this.usersService.updateEmail(userId, email.trim().toLowerCase());
  }

  @Patch('me/password')
  async updatePassword(
    @CurrentUser('id') userId: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      throw new BadRequestException('Mat khau moi phai co it nhat 6 ky tu');
    }
    return this.usersService.updatePassword(userId, currentPassword, newPassword);
  }

  @Delete('me')
  async deleteMe(@CurrentUser('id') userId: string) {
    return this.usersService.deleteAccount(userId);
  }

  @Post('me/device-token')
  async registerDeviceToken(
    @CurrentUser('id') userId: string,
    @Body('token') token: string,
  ) {
    if (!token || token.trim().length === 0) {
      throw new BadRequestException('Token không hợp lệ');
    }
    return this.usersService.updateDeviceToken(userId, token);
  }

  @Delete('me/device-token')
  async unregisterDeviceToken(@CurrentUser('id') userId: string) {
    return this.usersService.updateDeviceToken(userId, null);
  }

  // Dynamic ':id' route AFTER all 'me/*' routes
  @Public()
  @Get(':id')
  async getUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.usersService.getProfile(id, currentUserId);
  }

  @Post(':id/block')
  async blockUser(
    @CurrentUser('id') blockerId: string,
    @Param('id', ParseUUIDPipe) blockedId: string,
  ) {
    return this.usersService.blockUser(blockerId, blockedId);
  }
}
