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

  // Static routes MUST come before parameterized routes to avoid :id catching them

  @Public()
  @Get()
  async findAll(
    @Query() query: QueryPlaceDto,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.placesService.findAll(query, currentUserId);
  }

  @Public()
  @Get('nearby')
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius?: number,
    @Query('limit') limit?: number,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.placesService.findNearby(
      +lat,
      +lng,
      radius ? +radius : undefined,
      limit ? +limit : undefined,
      currentUserId,
    );
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

  // Dynamic :id route AFTER all static routes
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
    const normalizedDto = this.normalizeCreatePlaceDto(createPlaceDto);

    // Process images: optimize + upload to S3/local
    const imageUrls =
      files && files.length > 0
        ? await this.mediaService.processPlaceImages(files)
        : [];

    return this.placesService.create(userId, normalizedDto, imageUrls);
  }

  private normalizeCreatePlaceDto(dto: CreatePlaceDto): CreatePlaceDto {
    const tags = dto.tags as unknown;

    return {
      ...dto,
      latitude: Number(dto.latitude),
      longitude: Number(dto.longitude),
      tags:
        typeof tags === 'string'
          ? this.parseTags(tags)
          : Array.isArray(tags)
            ? tags
            : undefined,
      is_published:
        typeof dto.is_published === 'string'
          ? dto.is_published === 'true'
          : dto.is_published,
    };
  }

  private parseTags(tags: string): string[] {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed.map((tag) => String(tag).trim()).filter(Boolean);
      }
    } catch {}

    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
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
}
