import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PlacesService } from './places.service';
import { MediaService } from '../media/media.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { QueryPlaceDto } from './dto/query-place.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('places')
export class PlacesController {
  constructor(
    private readonly placesService: PlacesService,
    private readonly mediaService: MediaService,
  ) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryPlaceDto) {
    return this.placesService.findAll(query);
  }

  @Public()
  @Get('nearby')
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius?: number,
    @Query('limit') limit?: number,
  ) {
    return this.placesService.findNearby(
      +lat,
      +lng,
      radius ? +radius : undefined,
      limit ? +limit : undefined,
    );
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.placesService.findById(id, currentUserId);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @CurrentUser('id') userId: string,
    @Body() createPlaceDto: CreatePlaceDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Process images: optimize + upload to S3/local
    const imageUrls =
      files && files.length > 0
        ? await this.mediaService.processPlaceImages(files)
        : [];

    return this.placesService.create(userId, createPlaceDto, imageUrls);
  }

  @Post(':id/like')
  async toggleLike(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) placeId: string,
  ) {
    return this.placesService.toggleLike(userId, placeId);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) placeId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.placesService.deletePlace(placeId, userId);
  }

  @Post(':id/bookmark')
  async toggleBookmark(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) placeId: string,
  ) {
    return this.placesService.toggleBookmark(userId, placeId);
  }
  @Public()
  @Get('user/:userId')
  async getUserPlaces(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.placesService.getUserPlaces(
      userId,
      page ? +page : undefined,
      limit ? +limit : undefined,
    );
  }
}
