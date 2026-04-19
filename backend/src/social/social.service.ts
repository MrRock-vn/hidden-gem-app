import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Follow } from './entities/follow.entity';
import { Like } from './entities/like.entity';
import { Place } from '../places/entities/place.entity';
import { User } from '../users/entities/user.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PushNotificationService } from '../notifications/push-notification.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Follow)
    private followsRepository: Repository<Follow>,
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private realtimeGateway: RealtimeGateway,
    private pushNotificationService: PushNotificationService,
  ) {}

  // ===== COMMENTS =====

  async getPlaceComments(
    placeId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const [comments, total] = await this.commentsRepository.findAndCount({
      where: { place_id: placeId, parent_id: null as any },
      relations: ['user', 'replies', 'replies.user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: comments.map((c) => ({
        ...c,
        user: c.user
          ? {
              id: c.user.id,
              username: c.user.username,
              avatar_url: c.user.avatar_url,
            }
          : null,
        replies: c.replies?.map((r) => ({
          ...r,
          user: r.user
            ? {
                id: r.user.id,
                username: r.user.username,
                avatar_url: r.user.avatar_url,
              }
            : null,
        })),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createComment(userId: string, placeId: string, dto: CreateCommentDto) {
    const place = await this.placesRepository.findOne({
      where: { id: placeId },
      relations: ['user'],
    });
    if (!place) throw new NotFoundException('Không tìm thấy địa điểm');

    if (dto.parent_id) {
      const parent = await this.commentsRepository.findOne({
        where: { id: dto.parent_id, place_id: placeId },
      });
      if (!parent) throw new NotFoundException('Không tìm thấy bình luận gốc');
    }

    const comment = this.commentsRepository.create({
      user_id: userId,
      place_id: placeId,
      content: dto.content,
      parent_id: dto.parent_id || undefined,
    });

    const saved = await this.commentsRepository.save(comment);
    await this.placesRepository.increment({ id: placeId }, 'comment_count', 1);

    const fullComment = await this.commentsRepository.findOne({
      where: { id: (saved as Comment).id },
      relations: ['user'],
    });

    // Emit real-time event to place viewers
    this.realtimeGateway.emitNewComment(placeId, {
      id: fullComment!.id,
      content: fullComment!.content,
      created_at: fullComment!.created_at,
      parent_id: fullComment!.parent_id,
      user: {
        id: fullComment!.user.id,
        username: fullComment!.user.username,
        avatar_url: fullComment!.user.avatar_url,
      },
    });

    // Send push notification to place owner if they have a device token
    if (place.user && place.user.id !== userId) {
      const owner = await this.usersRepository.findOne({
        where: { id: place.user.id },
      });

      if (owner?.device_token && owner.push_notifications_enabled) {
        await this.pushNotificationService.notifyNewComment(
          place.user.id,
          place.title,
          fullComment!.user.username,
          dto.content,
          placeId,
        );
      }
    }

    // Send notifications to mentioned users
    if (dto.mentioned_usernames && dto.mentioned_usernames.length > 0) {
      const mentionedUsers = await this.usersRepository.find({
        where: dto.mentioned_usernames.map((username) => ({ username })),
      });

      for (const user of mentionedUsers) {
        if (
          user.id !== userId &&
          user.device_token &&
          user.push_notifications_enabled
        ) {
          await this.pushNotificationService.notifyMention(
            user.id,
            fullComment!.user.username,
            dto.content,
            placeId,
            'comment',
          );
        }
      }
    }

    return fullComment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Không tìm thấy bình luận');
    if (comment.user_id !== userId)
      throw new ForbiddenException('Không có quyền xóa');

    const placeId = comment.place_id;
    await this.commentsRepository.remove(comment);
    await this.placesRepository.decrement({ id: placeId }, 'comment_count', 1);

    // Emit real-time event
    this.realtimeGateway.emitCommentDeleted(placeId, commentId);

    return { message: 'Đã xóa bình luận' };
  }

  async likeComment(userId: string, commentId: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Không tìm thấy bình luận');

    // Toggle like on comment (using like_count field)
    comment.like_count += 1;
    await this.commentsRepository.save(comment);
    return { liked: true, like_count: comment.like_count };
  }

  // ===== FOLLOWS =====

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ConflictException('Không thể follow bản thân');
    }

    const existing = await this.followsRepository.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (existing) {
      // Already following - toggle off
      await this.followsRepository.remove(existing);
      return { following: false };
    }

    const follow = this.followsRepository.create({
      follower_id: followerId,
      following_id: followingId,
    });
    await this.followsRepository.save(follow);

    // Send push notification to the followed user
    const follower = await this.usersRepository.findOne({
      where: { id: followerId },
    });
    const followingUser = await this.usersRepository.findOne({
      where: { id: followingId },
    });

    if (
      followingUser?.device_token &&
      followingUser.push_notifications_enabled &&
      follower
    ) {
      await this.pushNotificationService.notifyNewFollower(
        followingId,
        follower.username,
      );
    }

    return { following: true };
  }

  async unfollowUser(followerId: string, followingId: string) {
    const existing = await this.followsRepository.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (!existing) {
      throw new NotFoundException('Chưa follow người dùng này');
    }

    await this.followsRepository.remove(existing);
    return { following: false };
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    const [follows, total] = await this.followsRepository.findAndCount({
      where: { following_id: userId },
      relations: ['follower'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: follows.map((f) => ({
        id: f.follower.id,
        username: f.follower.username,
        avatar_url: f.follower.avatar_url,
        bio: f.follower.bio,
        followed_at: f.created_at,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    const [follows, total] = await this.followsRepository.findAndCount({
      where: { follower_id: userId },
      relations: ['following'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: follows.map((f) => ({
        id: f.following.id,
        username: f.following.username,
        avatar_url: f.following.avatar_url,
        bio: f.following.bio,
        followed_at: f.created_at,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
