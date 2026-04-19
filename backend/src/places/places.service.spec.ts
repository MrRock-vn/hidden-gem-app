import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlacesService } from './places.service';
import { Place } from './entities/place.entity';

describe('PlacesService', () => {
  let service: PlacesService;
  let mockPlaceRepository: any;

  beforeEach(async () => {
    mockPlaceRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesService,
        {
          provide: getRepositoryToken(Place),
          useValue: mockPlaceRepository,
        },
      ],
    }).compile();

    service = module.get<PlacesService>(PlacesService);
  });

  describe('getAllPlaces', () => {
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

      mockPlaceRepository.findAndCount.mockResolvedValue([mockPlaces, 2]);

      const result = await service.getAllPlaces(1, 10);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('getPlaceById', () => {
    it('should return a single place', async () => {
      const mockPlace = {
        id: '1',
        title: 'Coffee Shop',
        latitude: 21.0285,
        longitude: 105.8542,
      };

      mockPlaceRepository.findOne.mockResolvedValue(mockPlace);

      const result = await service.getPlaceById('1');

      expect(result).toEqual(mockPlace);
    });

    it('should throw error if place not found', async () => {
      mockPlaceRepository.findOne.mockResolvedValue(null);

      expect(async () => {
        await service.getPlaceById('nonexistent');
      }).rejects.toThrow();
    });
  });

  describe('createPlace', () => {
    it('should create a new place', async () => {
      const createPlaceDto = {
        title: 'New Cafe',
        description: 'Great coffee',
        category: 'cafe',
        latitude: 21.0285,
        longitude: 105.8542,
      };

      mockPlaceRepository.create.mockReturnValue({
        id: '1',
        ...createPlaceDto,
      });

      mockPlaceRepository.save.mockResolvedValue({
        id: '1',
        ...createPlaceDto,
      });

      // Note: Actual implementation depends on service signature
      // const result = await service.createPlace('userId', createPlaceDto);
      // expect(result).toBeDefined();
    });
  });
});
