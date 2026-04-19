import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ===== COMMENTS =====

  @Public()
  @Get('places/:placeId/comments')
  async getPlaceComments(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.socialService.getPlaceComments(placeId, page ? +page : undefined, limit ? +limit : undefined);
  }

  @Post('places/:placeId/comments')
  async createComment(
    @CurrentUser('id') userId: string,
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.socialService.createComment(userId, placeId, dto);
  }

  @Delete('comments/:id')
  async deleteComment(
    @Param('id', ParseUUIDPipe) commentId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.socialService.deleteComment(commentId, userId);
  }

  @Post('comments/:id/like')
  async likeComment(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) commentId: string,
  ) {
    return this.socialService.likeComment(userId, commentId);
  }

  // ===== FOLLOWS =====

  @Post('users/:id/follow')
  async followUser(
    @CurrentUser('id') followerId: string,
    @Param('id', ParseUUIDPipe) followingId: string,
  ) {
    return this.socialService.followUser(followerId, followingId);
  }

  @Delete('users/:id/follow')
  async unfollowUser(
    @CurrentUser('id') followerId: string,
    @Param('id', ParseUUIDPipe) followingId: string,
  ) {
    return this.socialService.unfollowUser(followerId, followingId);
  }

  @Public()
  @Get('users/:id/followers')
  async getFollowers(
    @Param('id', ParseUUIDPipe) userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.socialService.getFollowers(userId, page ? +page : undefined, limit ? +limit : undefined);
  }

  @Public()
  @Get('users/:id/following')
  async getFollowing(
    @Param('id', ParseUUIDPipe) userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.socialService.getFollowing(userId, page ? +page : undefined, limit ? +limit : undefined);
  }
}
