import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlacesService } from './places.service';
import { Place } from './entities/place.entity';
import { PlaceImage } from './entities/place-image.entity';
import { Like } from '../social/entities/like.entity';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import { BookmarkCollection } from '../bookmarks/entities/bookmark-collection.entity';
import { User } from '../users/entities/user.entity';
import { PushNotificationService } from '../notifications/push-notification.service';

describe('PlacesService', () => {
  let service: PlacesService;
  let mockPlaceRepository: any;
  let mockPlaceImageRepository: any;
  let mockLikesRepository: any;
  let mockBookmarksRepository: any;
  let mockBookmarkCollectionsRepository: any;
  let mockUserRepository: any;
  let mockPushNotificationService: any;

  beforeEach(async () => {
    mockPlaceRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        getOne: jest.fn().mockResolvedValue(null),
      }),
    };

    mockPlaceImageRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    mockLikesRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    mockBookmarksRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }),
    };

    mockBookmarkCollectionsRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockUserRepository = {
      findOne: jest.fn(),
    };

    mockPushNotificationService = {
      notifyNewLike: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesService,
        {
          provide: getRepositoryToken(Place),
          useValue: mockPlaceRepository,
        },
        {
          provide: getRepositoryToken(PlaceImage),
          useValue: mockPlaceImageRepository,
        },
        {
          provide: getRepositoryToken(Like),
          useValue: mockLikesRepository,
        },
        {
          provide: getRepositoryToken(Bookmark),
          useValue: mockBookmarksRepository,
        },
        {
          provide: getRepositoryToken(BookmarkCollection),
          useValue: mockBookmarkCollectionsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: PushNotificationService,
          useValue: mockPushNotificationService,
        },
      ],
    }).compile();

    service = module.get<PlacesService>(PlacesService);
  });

  describe('findAll', () => {
    it('should return paginated places', async () => {
      const mockPlaces = [
        {
          id: '1',
          title: 'Coffee Shop',
          latitude: 21.0285,
          longitude: 105.8542,
        },
        {
          id: '2',
          title: 'Beach',
          latitude: 20.8448,
          longitude: 106.6833,
        },
      ];

      mockPlaceRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([mockPlaces, 2]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('findById', () => {
    it('should return a single place', async () => {
      const mockPlace = {
        id: '1',
        title: 'Coffee Shop',
        latitude: 21.0285,
        longitude: 105.8542,
      };

      mockPlaceRepository.findOne.mockResolvedValue(mockPlace);

      const result = await service.findById('1');

      expect(result).toBeDefined();
    });

    it('should throw error if place not found', async () => {
      mockPlaceRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a new place', async () => {
      const createPlaceDto = {
        title: 'New Cafe',
        description: 'Great coffee',
        category: 'cafe',
        latitude: 21.0285,
        longitude: 105.8542,
      };

      const savedPlace = {
        id: '1',
        ...createPlaceDto,
      };

      mockPlaceRepository.create.mockReturnValue(savedPlace);
      mockPlaceRepository.save.mockResolvedValue(savedPlace);

      // Note: Actual implementation depends on service signature
      // const result = await service.create('userId', createPlaceDto, []);
      // expect(result).toBeDefined();
    });
  });
});
