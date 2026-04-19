import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  async search(
    @Query('q') q: string,
    @Query('category') category?: string,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius?: number,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (!q || q.trim().length === 0) {
      return { places: { data: [], total: 0 }, users: { data: [], total: 0 } };
    }

    return this.searchService.search(
      q.trim(),
      {
        category,
        lat: lat ? +lat : undefined,
        lng: lng ? +lng : undefined,
        radius: radius ? +radius : undefined,
        type,
      },
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Public()
  @Get('suggestions')
  async getSuggestions(
    @Query('q') q: string,
    @Query('limit') limit?: number,
  ) {
    if (!q || q.trim().length < 2) {
      return [];
    }
    return this.searchService.getSuggestions(q.trim(), limit ? +limit : 5);
  }

  @Public()
  @Get('trending')
  async getTrending(@Query('limit') limit?: number) {
    return this.searchService.getTrending(limit ? +limit : 10);
  }
}
