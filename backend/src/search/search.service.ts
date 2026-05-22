import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Client } from '@elastic/elasticsearch';
import { Place } from '../places/entities/place.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private elasticsearchClient: Client | null = null;
  private useElasticsearch: boolean = false;

  constructor(
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.initializeElasticsearch();
  }

  private initializeElasticsearch() {
    try {
      const esUrl = this.configService.get('ELASTICSEARCH_URL');
      if (!esUrl) {
        this.logger.warn(
          'ELASTICSEARCH_URL not configured. Using database search only.',
        );
        return;
      }

      this.elasticsearchClient = new Client({
        node: esUrl,
      });
      this.useElasticsearch = true;
      this.logger.log(`Connected to Elasticsearch at ${esUrl}`);
    } catch (error) {
      this.logger.error('Failed to initialize Elasticsearch:', error);
      this.useElasticsearch = false;
    }
  }

  async search(
    q: string,
    filters?: {
      category?: string;
      lat?: number;
      lng?: number;
      radius?: number;
      type?: string; // 'places' | 'users' | 'all'
    },
    page: number = 1,
    limit: number = 20,
  ) {
    // Try Elasticsearch first, fall back to database
    if (
      this.useElasticsearch &&
      (filters?.type === 'places' || !filters?.type)
    ) {
      try {
        return await this.searchWithElasticsearch(q, filters, page, limit);
      } catch (error) {
        this.logger.warn(
          'Elasticsearch search failed, falling back to database:',
          error,
        );
        this.useElasticsearch = false; // Disable temporarily
      }
    }

    // Fall back to database search
    return await this.searchWithDatabase(q, filters, page, limit);
  }

  private async searchWithElasticsearch(
    q: string,
    filters?: any,
    page: number = 1,
    limit: number = 20,
  ) {
    const offset = (page - 1) * limit;
    const results: any = {};

    try {
      // Search places in Elasticsearch
      const esQuery: any = {
        bool: {
          must: [
            {
              multi_match: {
                query: q,
                fields: ['title^3', 'description', 'city'],
                fuzziness: 'AUTO',
              },
            },
          ],
        },
      };

      // Add category filter
      if (filters?.category) {
        esQuery.bool.filter = {
          term: { category: filters.category.toLowerCase() },
        };
      }

      const response = await this.elasticsearchClient!.search({
        index: 'places',
        query: esQuery,
        from: offset,
        size: limit,
        sort:
          filters?.lat && filters?.lng
            ? [
                {
                  _geo_distance: {
                    location: { lat: filters.lat, lon: filters.lng },
                    order: 'asc',
                    unit: 'km',
                  },
                },
              ]
            : [{ like_count: { order: 'desc' } }],
      });

      const total = (response.hits.total as any).value;
      const placesIds = response.hits.hits.map((hit: any) => hit._id);

      // Fetch full place data from database
      if (placesIds.length > 0) {
        const places = await this.placesRepository
          .createQueryBuilder('place')
          .leftJoinAndSelect('place.images', 'images')
          .leftJoinAndSelect('place.user', 'user')
          .whereInIds(placesIds)
          .getMany();

        results.places = {
          data: places.map((p) => ({
            ...p,
            user: p.user
              ? {
                  id: p.user.id,
                  username: p.user.username,
                  avatar_url: p.user.avatar_url,
                }
              : null,
          })),
          total,
        };
      } else {
        results.places = { data: [], total: 0 };
      }

      return results;
    } catch (error) {
      this.logger.error('Elasticsearch search error:', error);
      throw error;
    }
  }

  private async searchWithDatabase(
    q: string,
    filters?: any,
    page: number = 1,
    limit: number = 20,
  ) {
    const type = filters?.type || 'all';
    const results: any = {};

    // Search places
    if (type === 'all' || type === 'places') {
      const placesQuery = this.placesRepository
        .createQueryBuilder('place')
        .leftJoinAndSelect('place.images', 'images')
        .leftJoinAndSelect('place.user', 'user')
        .where('place.is_published = :published', { published: true })
        .andWhere(
          '(place.title ILIKE :q OR place.description ILIKE :q OR place.address ILIKE :q OR :tag = ANY(place.tags))',
          { q: `%${q}%`, tag: q.toLowerCase().replace('#', '') },
        );

      if (filters?.category) {
        placesQuery.andWhere('place.category = :category', {
          category: filters.category,
        });
      }

      // Geo filter
      if (filters?.lat && filters?.lng) {
        const radius = filters.radius || 10;
        placesQuery.addSelect(
          `(6371 * acos(cos(radians(:lat)) * cos(radians(place.latitude)) * cos(radians(place.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(place.latitude))))`,
          'distance',
        );
        placesQuery.setParameter('lat', filters.lat);
        placesQuery.setParameter('lng', filters.lng);
        placesQuery.andWhere(
          `(6371 * acos(cos(radians(:filterLat)) * cos(radians(place.latitude)) * cos(radians(place.longitude) - radians(:filterLng)) + sin(radians(:filterLat)) * sin(radians(place.latitude)))) <= :radius`,
          { filterLat: filters.lat, filterLng: filters.lng, radius },
        );
        placesQuery.orderBy('distance', 'ASC');
      } else {
        placesQuery.orderBy('place.like_count', 'DESC');
      }

      placesQuery.skip((page - 1) * limit).take(limit);

      const [places, placesTotal] = await placesQuery.getManyAndCount();
      results.places = {
        data: places.map((p) => ({
          ...p,
          user: p.user
            ? {
                id: p.user.id,
                username: p.user.username,
                avatar_url: p.user.avatar_url,
              }
            : null,
        })),
        total: placesTotal,
      };
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const [users, usersTotal] = await this.usersRepository.findAndCount({
        where: [
          { username: ILike(`%${q}%`) },
          { bio: ILike(`%${q}%`) },
          { city: ILike(`%${q}%`) },
        ],
        select: ['id', 'username', 'avatar_url', 'bio', 'city'],
        skip: (page - 1) * limit,
        take: limit,
      });

      results.users = { data: users, total: usersTotal };
    }

    return results;
  }

  async getSuggestions(q: string, limit: number = 5) {
    const places = await this.placesRepository
      .createQueryBuilder('place')
      .select(['place.id', 'place.title', 'place.category'])
      .where('place.title ILIKE :q', { q: `%${q}%` })
      .andWhere('place.is_published = true')
      .orderBy('place.like_count', 'DESC')
      .take(limit)
      .getMany();

    return places.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      type: 'place',
    }));
  }

  async getTrending(limit: number = 10) {
    const places = await this.placesRepository.find({
      where: { is_published: true },
      relations: ['images'],
      order: { like_count: 'DESC' },
      take: limit,
    });

    // Extract trending tags from top places
    const tagMap = new Map<string, number>();
    places.forEach((p) => {
      p.tags?.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });

    const trendingTags = Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return { trending_places: places.slice(0, 5), trending_tags: trendingTags };
  }

  async indexPlace(placeId: string, data: any) {
    if (!this.useElasticsearch || !this.elasticsearchClient) {
      this.logger.warn('Elasticsearch not available for indexing');
      return;
    }

    try {
      await this.elasticsearchClient.index({
        index: 'places',
        id: placeId,
        body: {
          id: placeId,
          title: data.title,
          description: data.description,
          category: data.category,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to index place ${placeId}:`, error);
    }
  }

  async indexUser(userId: string, data: any) {
    if (!this.useElasticsearch || !this.elasticsearchClient) {
      this.logger.warn('Elasticsearch not available for indexing');
      return;
    }

    try {
      await this.elasticsearchClient.index({
        index: 'users',
        id: userId,
        body: {
          id: userId,
          username: data.username,
          bio: data.bio,
          city: data.city,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to index user ${userId}:`, error);
    }
  }

  async deleteFromIndex(indexName: string, id: string) {
    if (!this.useElasticsearch || !this.elasticsearchClient) {
      this.logger.warn('Elasticsearch not available for deletion');
      return;
    }

    try {
      await this.elasticsearchClient.delete({
        index: indexName,
        id,
      });
    } catch (error) {
      this.logger.error(`Failed to delete ${id} from ${indexName}:`, error);
    }
  }
}
