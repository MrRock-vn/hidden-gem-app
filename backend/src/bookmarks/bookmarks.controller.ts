import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get('users/me/bookmarks')
  async getMyCollections(@CurrentUser('id') userId: string) {
    return this.bookmarksService.getUserCollections(userId);
  }

  @Post('bookmarks/collections')
  async createCollection(
    @CurrentUser('id') userId: string,
    @Body('name') name: string,
    @Body('is_public') isPublic?: boolean,
  ) {
    return this.bookmarksService.createCollection(userId, name, isPublic);
  }

  @Post('bookmarks/collections/:id/places')
  async addPlace(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) collectionId: string,
    @Body('place_id') placeId: string,
  ) {
    return this.bookmarksService.addPlaceToCollection(collectionId, placeId, userId);
  }

  @Delete('bookmarks/collections/:id/places/:placeId')
  async removePlace(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) collectionId: string,
    @Param('placeId', ParseUUIDPipe) placeId: string,
  ) {
    return this.bookmarksService.removePlaceFromCollection(collectionId, placeId, userId);
  }

  @Delete('bookmarks/collections/:id')
  async deleteCollection(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) collectionId: string,
  ) {
    return this.bookmarksService.deleteCollection(collectionId, userId);
  }
}
