import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Follow } from '../social/entities/follow.entity';
import { Block } from '../social/entities/block.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Follow)
    private followsRepository: Repository<Follow>,
    @InjectRepository(Block)
    private blocksRepository: Repository<Block>,
  ) {}

  async findById(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return this.sanitizeUser(user);
  }

  async getProfile(userId: string, currentUserId?: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Count followers/following
    const [followersCount, followingCount] = await Promise.all([
      this.followsRepository.count({ where: { following_id: userId } }),
      this.followsRepository.count({ where: { follower_id: userId } }),
    ]);

    let isFollowing = false;
    let isBlocked = false;

    if (currentUserId && currentUserId !== userId) {
      const [follow, block] = await Promise.all([
        this.followsRepository.findOne({
          where: { follower_id: currentUserId, following_id: userId },
        }),
        this.blocksRepository.findOne({
          where: { blocker_id: currentUserId, blocked_id: userId },
        }),
      ]);
      isFollowing = !!follow;
      isBlocked = !!block;
    }

    return {
      ...this.sanitizeUser(user),
      followers_count: followersCount,
      following_count: followingCount,
      is_following: isFollowing,
      is_blocked: isBlocked,
    };
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.username) {
      const existing = await this.usersRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Username đã được sử dụng');
      }
    }

    await this.usersRepository.update(userId, updateUserDto);
    return this.findById(userId);
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    await this.usersRepository.update(userId, { avatar_url: avatarUrl });
    return this.findById(userId);
  }

  async getSettings(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    return {
      push_notifications: true,
      is_private: user.is_private,
      dark_mode: true,
      email: user.email,
    };
  }

  async updateSettings(
    userId: string,
    settings: {
      is_private?: boolean;
      push_notifications?: boolean;
      dark_mode?: boolean;
    },
  ) {
    const updateData: Partial<{ is_private: boolean }> = {};

    if (settings.is_private !== undefined) {
      updateData.is_private = settings.is_private;
    }

    if (Object.keys(updateData).length > 0) {
      await this.usersRepository.update(userId, updateData);
    }

    return this.getSettings(userId);
  }

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new ConflictException('Không thể tự block bản thân');
    }

    const existing = await this.blocksRepository.findOne({
      where: { blocker_id: blockerId, blocked_id: blockedId },
    });

    if (existing) {
      // Unblock
      await this.blocksRepository.remove(existing);
      return { blocked: false };
    }

    // Block + unfollow both ways
    const block = this.blocksRepository.create({
      blocker_id: blockerId,
      blocked_id: blockedId,
    });

    await Promise.all([
      this.blocksRepository.save(block),
      this.followsRepository.delete({
        follower_id: blockerId,
        following_id: blockedId,
      }),
      this.followsRepository.delete({
        follower_id: blockedId,
        following_id: blockerId,
      }),
    ]);

    return { blocked: true };
  }

  async updateDeviceToken(userId: string, deviceToken: string | null) {
    const updateData: any = {
      device_token: deviceToken === null ? null : deviceToken,
    };

    await this.usersRepository.update(userId, updateData);

    return {
      success: true,
      message: deviceToken ? 'Device token registered' : 'Device token removed',
    };
  }

  private sanitizeUser(user: User) {
    const { password, refresh_token, google_id, apple_id, ...sanitized } = user;
    return sanitized;
  }
}
