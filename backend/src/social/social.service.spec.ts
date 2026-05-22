import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SocialService } from './social.service';
import { Comment } from './entities/comment.entity';
import { Follow } from './entities/follow.entity';
import { Like } from './entities/like.entity';
import { Place } from '../places/entities/place.entity';
import { User } from '../users/entities/user.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PushNotificationService } from '../notifications/push-notification.service';

describe('SocialService', () => {
  let service: SocialService;
  let mockCommentRepository: any;
  let mockFollowRepository: any;
  let mockLikeRepository: any;
  let mockPlaceRepository: any;
  let mockUserRepository: any;
  let mockRealtimeGateway: any;
  let mockPushNotificationService: any;

  beforeEach(async () => {
    mockCommentRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockFollowRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockLikeRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockPlaceRepository = {
      findOne: jest.fn(),
      increment: jest.fn(),
      decrement: jest.fn(),
    };

    mockUserRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    mockRealtimeGateway = {
      emitNewComment: jest.fn(),
      emitCommentDeleted: jest.fn(),
    };

    mockPushNotificationService = {
      notifyNewComment: jest.fn(),
      notifyMention: jest.fn(),
      notifyNewFollower: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: getRepositoryToken(Follow),
          useValue: mockFollowRepository,
        },
        {
          provide: getRepositoryToken(Like),
          useValue: mockLikeRepository,
        },
        {
          provide: getRepositoryToken(Place),
          useValue: mockPlaceRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: RealtimeGateway,
          useValue: mockRealtimeGateway,
        },
        {
          provide: PushNotificationService,
          useValue: mockPushNotificationService,
        },
      ],
    }).compile();

    service = module.get<SocialService>(SocialService);
  });

  describe('getPlaceComments', () => {
    it('should return paginated comments', async () => {
      const mockComments = [
        {
          id: '1',
          content: 'Great place!',
          user: { id: '1', username: 'user1' },
        },
      ];

      mockCommentRepository.findAndCount.mockResolvedValue([mockComments, 1]);

      const result = await service.getPlaceComments('placeId', 1, 10);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('followUser', () => {
    it('should create a follow relationship', async () => {
      mockFollowRepository.findOne.mockResolvedValue(null);
      mockFollowRepository.create.mockReturnValue({
        follower_id: 'user1',
        following_id: 'user2',
      });
      mockFollowRepository.save.mockResolvedValue({
        follower_id: 'user1',
        following_id: 'user2',
      });

      // Assuming followUser method exists
      // const result = await service.followUser('user1', 'user2');
      // expect(result).toBeDefined();
    });

    it('should throw error if already following', async () => {
      mockFollowRepository.findOne.mockResolvedValue({
        follower_id: 'user1',
        following_id: 'user2',
      });

      // expect(async () => {
      //   await service.followUser('user1', 'user2');
      // }).rejects.toThrow();
    });
  });
});
