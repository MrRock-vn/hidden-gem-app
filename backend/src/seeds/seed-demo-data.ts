import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Place } from '../places/entities/place.entity';
import { Like } from '../social/entities/like.entity';
import { Comment } from '../social/entities/comment.entity';
import { Follow } from '../social/entities/follow.entity';
import { BookmarkCollection } from '../bookmarks/entities/bookmark-collection.entity';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import {
  Notification,
  NotificationType,
} from '../notifications/entities/notification.entity';

const demoUsers = [
  {
    username: 'coffeeaddict',
    email: 'coffee@example.com',
    password: 'coffee123',
    avatar_url: 'https://i.pravatar.cc/150?img=11',
    bio: 'San lung specialty coffee va khong gian lam viec yen tinh.',
    city: 'TP.HCM',
  },
  {
    username: 'photohunter',
    email: 'photo@example.com',
    password: 'photo123',
    avatar_url: 'https://i.pravatar.cc/150?img=22',
    bio: 'Di bo, chup anh, luu lai nhung goc pho it nguoi biet.',
    city: 'Da Nang',
  },
  {
    username: 'foodielover',
    email: 'foodie@example.com',
    password: 'foodie123',
    avatar_url: 'https://i.pravatar.cc/150?img=33',
    bio: 'Review quan ngon gia on, dac biet la mon Viet va an vat.',
    city: 'Ha Noi',
  },
  {
    username: 'naturelover',
    email: 'nature@example.com',
    password: 'nature123',
    avatar_url: 'https://i.pravatar.cc/150?img=44',
    bio: 'Thich di xa, tim nhung noi xanh va yen binh.',
    city: 'Da Lat',
  },
];

const commentSamples = [
  'Cho nay rat dang ghe, khong gian de chiu va de tim.',
  'Minh da luu lai de cuoi tuan quay lai cung ban be.',
  'Anh trong app nhin dung vibe, ngoai doi con dep hon.',
];

export async function seedDemoData(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const placeRepository = dataSource.getRepository(Place);
  const likeRepository = dataSource.getRepository(Like);
  const commentRepository = dataSource.getRepository(Comment);
  const followRepository = dataSource.getRepository(Follow);
  const collectionRepository = dataSource.getRepository(BookmarkCollection);
  const bookmarkRepository = dataSource.getRepository(Bookmark);
  const notificationRepository = dataSource.getRepository(Notification);

  const demoUser = await userRepository.findOne({
    where: { email: 'demo@example.com' },
  });

  const users: User[] = [];
  if (demoUser) {
    await userRepository.update(demoUser.id, {
      username: 'demo_user',
      password: await bcrypt.hash('demo123456', 10),
      bio: 'Local explorer thich tim quan an, cafe va goc chup anh an minh.',
      city: 'TP.HCM',
      avatar_url: demoUser.avatar_url || 'https://i.pravatar.cc/150?img=1',
    });
    users.push(demoUser);
  }

  for (const userSeed of demoUsers) {
    let user = await userRepository.findOne({ where: { email: userSeed.email } });

    if (!user) {
      user = await userRepository.save(
        userRepository.create({
          ...userSeed,
          password: await bcrypt.hash(userSeed.password, 10),
        }),
      );
      console.log(`✓ Created demo profile: ${userSeed.email}`);
    } else {
      await userRepository.update(user.id, {
        username: userSeed.username,
        avatar_url: userSeed.avatar_url,
        bio: userSeed.bio,
        city: userSeed.city,
      });
    }

    users.push(user);
  }

  const places = await placeRepository.find({ order: { created_at: 'DESC' } });
  if (users.length === 0 || places.length === 0) {
    console.log('No users or places found for demo enrichment');
    return;
  }

  for (let i = 0; i < places.length; i += 1) {
    const owner = users[i % users.length];
    await placeRepository.update(places[i].id, {
      user_id: owner.id,
      is_published: true,
    });

    await placeRepository
      .createQueryBuilder()
      .update(Place)
      .set({
        location: () => 'ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)',
      })
      .setParameter('lng', places[i].longitude)
      .setParameter('lat', places[i].latitude)
      .where('id = :id', { id: places[i].id })
      .execute();
  }

  for (let i = 0; i < users.length; i += 1) {
    for (let j = 0; j < users.length; j += 1) {
      if (i === j || (i + j) % 2 === 0) continue;
      const existingFollow = await followRepository.findOne({
        where: { follower_id: users[i].id, following_id: users[j].id },
      });
      if (!existingFollow) {
        await followRepository.save(
          followRepository.create({
            follower_id: users[i].id,
            following_id: users[j].id,
          }),
        );
      }
    }
  }

  for (let i = 0; i < places.length; i += 1) {
    const place = places[i];
    const likerCount = Math.min(users.length, (i % users.length) + 1);

    for (let j = 0; j < likerCount; j += 1) {
      const user = users[(i + j) % users.length];
      const existingLike = await likeRepository.findOne({
        where: { user_id: user.id, place_id: place.id },
      });
      if (!existingLike) {
        await likeRepository.save(
          likeRepository.create({ user_id: user.id, place_id: place.id }),
        );
      }
    }

    if (i < 16) {
      for (let j = 0; j < commentSamples.length; j += 1) {
        const user = users[(i + j + 1) % users.length];
        const existingComment = await commentRepository.findOne({
          where: {
            user_id: user.id,
            place_id: place.id,
            content: commentSamples[j],
          },
        });
        if (!existingComment) {
          await commentRepository.save(
            commentRepository.create({
              user_id: user.id,
              place_id: place.id,
              content: commentSamples[j],
            }),
          );
        }
      }
    }
  }

  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    let collection = await collectionRepository.findOne({
      where: { user_id: user.id, name: 'Yeu thich' },
    });

    if (!collection) {
      collection = await collectionRepository.save(
        collectionRepository.create({
          user_id: user.id,
          name: 'Yeu thich',
          is_public: i % 2 === 0,
        }),
      );
    }

    const start = i * 3;
    for (const place of places.slice(start, start + 8)) {
      const existingBookmark = await bookmarkRepository.findOne({
        where: { collection_id: collection.id, place_id: place.id },
      });
      if (!existingBookmark) {
        await bookmarkRepository.save(
          bookmarkRepository.create({
            collection_id: collection.id,
            place_id: place.id,
          }),
        );
      }
    }
  }

  const receiver = users[0];
  for (const actor of users.slice(1)) {
    const place = places.find((p) => p.user_id !== actor.id) || places[0];
    const existingNotification = await notificationRepository.findOne({
      where: {
        user_id: receiver.id,
        actor_id: actor.id,
        place_id: place.id,
        type: NotificationType.LIKE,
      },
    });

    if (!existingNotification) {
      await notificationRepository.save(
        notificationRepository.create({
          user_id: receiver.id,
          actor_id: actor.id,
          place_id: place.id,
          type: NotificationType.LIKE,
          is_read: false,
        }),
      );
    }
  }

  for (const place of places) {
    const [likeCount, commentCount, bookmarkCount] = await Promise.all([
      likeRepository.count({ where: { place_id: place.id } }),
      commentRepository.count({ where: { place_id: place.id } }),
      bookmarkRepository.count({ where: { place_id: place.id } }),
    ]);

    await placeRepository.update(place.id, {
      like_count: likeCount,
      comment_count: commentCount,
      bookmark_count: bookmarkCount,
    });
  }

  console.log('✓ Demo social data seeded');
}
