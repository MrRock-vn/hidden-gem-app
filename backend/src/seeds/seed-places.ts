import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Place } from '../places/entities/place.entity';
import { PlaceImage } from '../places/entities/place-image.entity';
import * as bcrypt from 'bcrypt';

const seedData = [
  {
    category: 'cafe',
    places: [
      {
        title: 'The Brew Haven',
        description: 'Quán cà phê yên tĩnh với không gian ấm cúng, phục vụ cà phê specialty',
        latitude: 10.7769,
        longitude: 106.7009,
        address: '123 Nguyễn Huệ, Q.1, TP.HCM',
        tags: ['coffee', 'cozy', 'wifi'],
        image: 'https://images.unsplash.com/photo-1495474472645-4d71bcdd2085?w=500&h=500&fit=crop',
      },
      {
        title: 'Morning Glory Café',
        description: 'Quán cà phê sáng tạo với menu đa dạng và trang trí hiện đại',
        latitude: 10.7780,
        longitude: 106.7020,
        address: '456 Lê Lợi, Q.1, TP.HCM',
        tags: ['coffee', 'modern', 'pastry'],
        image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&h=500&fit=crop',
      },
      {
        title: 'Vintage Coffee Corner',
        description: 'Quán cà phê vintage với nội thất retro và cà phê chất lượng cao',
        latitude: 10.7750,
        longitude: 106.6990,
        address: '789 Đồng Khởi, Q.1, TP.HCM',
        tags: ['coffee', 'vintage', 'aesthetic'],
        image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=500&h=500&fit=crop',
      },
      {
        title: 'Espresso Express',
        description: 'Quán cà phê nhanh với espresso tuyệt vời và không gian hiện đại',
        latitude: 10.7760,
        longitude: 106.7010,
        address: '321 Trần Hưng Đạo, Q.1, TP.HCM',
        tags: ['coffee', 'espresso', 'quick'],
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=500&fit=crop',
      },
    ],
  },
  {
    category: 'food',
    places: [
      {
        title: 'Phở Hà Nội Authentic',
        description: 'Quán phở truyền thống với nước dùng nấu suốt 12 tiếng',
        latitude: 10.7770,
        longitude: 106.7015,
        address: '111 Pasteur, Q.1, TP.HCM',
        tags: ['pho', 'vietnamese', 'authentic'],
        image: 'https://images.unsplash.com/photo-1582878657360-e8b0b6e6e6e0?w=500&h=500&fit=crop',
      },
      {
        title: 'Bánh Mì Saigon',
        description: 'Bánh mì ngon với nhân tươi và giá cả phải chăng',
        latitude: 10.7755,
        longitude: 106.7005,
        address: '222 Cách Mạng Tháng 8, Q.3, TP.HCM',
        tags: ['banh-mi', 'street-food', 'cheap'],
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?w=500&h=500&fit=crop',
      },
      {
        title: 'Cơm Tấm Sài Gòn',
        description: 'Cơm tấm nóng hổi với thịt nướng và trứng ốp la',
        latitude: 10.7765,
        longitude: 106.7025,
        address: '333 Nguyễn Thái Bình, Q.1, TP.HCM',
        tags: ['com-tam', 'vietnamese', 'breakfast'],
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
      },
      {
        title: 'Bún Chả Hà Nội',
        description: 'Bún chả nổi tiếng với thịt nướng thơm lừng',
        latitude: 10.7745,
        longitude: 106.6995,
        address: '444 Võ Văn Tần, Q.3, TP.HCM',
        tags: ['bun-cha', 'vietnamese', 'lunch'],
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
      },
    ],
  },
  {
    category: 'photo',
    places: [
      {
        title: 'Bitexco Financial Tower',
        description: 'Tòa nhà biểu tượng của TP.HCM với view tuyệt đẹp từ trên cao',
        latitude: 10.7735,
        longitude: 106.7020,
        address: '2 Hải Triều, Q.1, TP.HCM',
        tags: ['architecture', 'skyline', 'sunset'],
        image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=500&h=500&fit=crop',
      },
      {
        title: 'Bến Nhâm Riverside',
        description: 'Bờ sông Sài Gòn yên tĩnh, lý tưởng cho chụp ảnh buổi chiều',
        latitude: 10.7700,
        longitude: 106.7000,
        address: 'Bến Nhâm, Q.1, TP.HCM',
        tags: ['riverside', 'sunset', 'nature'],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop',
      },
      {
        title: 'Tao Đàn Park',
        description: 'Công viên xanh giữa lòng thành phố, nơi lý tưởng để chụp ảnh thiên nhiên',
        latitude: 10.7800,
        longitude: 106.7050,
        address: 'Tao Đàn, Q.1, TP.HCM',
        tags: ['park', 'nature', 'green'],
        image: 'https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=500&h=500&fit=crop',
      },
      {
        title: 'Saigon Opera House',
        description: 'Nhà hát lớn Sài Gòn với kiến trúc Pháp cổ điển tuyệt đẹp',
        latitude: 10.7720,
        longitude: 106.7030,
        address: '7 Lam Sơn, Q.1, TP.HCM',
        tags: ['architecture', 'historic', 'colonial'],
        image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=500&h=500&fit=crop',
      },
    ],
  },
  {
    category: 'nature',
    places: [
      {
        title: 'Cần Giờ Mangrove Forest',
        description: 'Rừng ngập mặn tuyệt đẹp với hệ sinh thái phong phú',
        latitude: 10.3500,
        longitude: 106.9500,
        address: 'Cần Giờ, TP.HCM',
        tags: ['mangrove', 'nature', 'eco-tourism'],
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=500&fit=crop',
      },
      {
        title: 'Vườn Quốc Gia Cát Tiên',
        description: 'Vườn quốc gia với đa dạng sinh vật và cảnh quan thiên nhiên',
        latitude: 11.4500,
        longitude: 107.2500,
        address: 'Cát Tiên, Lâm Đồng',
        tags: ['national-park', 'wildlife', 'hiking'],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop',
      },
      {
        title: 'Hồ Tây Hanoi',
        description: 'Hồ nước lớn nhất Hà Nội với cảnh quan yên bình',
        latitude: 21.0500,
        longitude: 105.8500,
        address: 'Hồ Tây, Hà Nội',
        tags: ['lake', 'scenic', 'peaceful'],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop',
      },
      {
        title: 'Núi Bà Đen',
        description: 'Ngọn núi cao nhất Tây Ninh với view toàn cảnh tuyệt đẹp',
        latitude: 11.3000,
        longitude: 106.1000,
        address: 'Tây Ninh',
        tags: ['mountain', 'hiking', 'temple'],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop',
      },
    ],
  },
  {
    category: 'art',
    places: [
      {
        title: 'Bảo Tàng Mỹ Thuật TP.HCM',
        description: 'Bảo tàng trưng bày các tác phẩm mỹ thuật Việt Nam',
        latitude: 10.7750,
        longitude: 106.6950,
        address: '97A Phó Đức Chính, Q.1, TP.HCM',
        tags: ['museum', 'art', 'culture'],
        image: 'https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=500&h=500&fit=crop',
      },
      {
        title: 'Nhà Thờ Đức Bà',
        description: 'Nhà thờ Đức Bà Sài Gòn với kiến trúc Gothic tuyệt đẹp',
        latitude: 10.7790,
        longitude: 106.7010,
        address: '1 Công Xã Paris, Q.1, TP.HCM',
        tags: ['architecture', 'historic', 'religious'],
        image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=500&fit=crop',
      },
      {
        title: 'Phố Tây Bùi Viện',
        description: 'Phố đi bộ với các quán bar, nhà hàng và cửa hàng nghệ thuật',
        latitude: 10.7680,
        longitude: 106.6920,
        address: 'Bùi Viện, Q.1, TP.HCM',
        tags: ['street', 'nightlife', 'art'],
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop',
      },
      {
        title: 'Bảo Tàng Chiến Tranh',
        description: 'Bảo tàng lịch sử với các hiện vật và tư liệu quý giá',
        latitude: 10.7710,
        longitude: 106.6880,
        address: '28 Võ Văn Tần, Q.3, TP.HCM',
        tags: ['museum', 'history', 'culture'],
        image: 'https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=500&h=500&fit=crop',
      },
    ],
  },
  {
    category: 'nightlife',
    places: [
      {
        title: 'Lush Nightclub',
        description: 'Hộp đêm hiện đại với nhạc sống và DJ nổi tiếng',
        latitude: 10.7700,
        longitude: 106.6900,
        address: '2 Tôn Đức Thắng, Q.1, TP.HCM',
        tags: ['nightclub', 'music', 'party'],
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop',
      },
      {
        title: 'Rooftop Bar Saigon',
        description: 'Quán bar trên mái nhà với view toàn cảnh thành phố',
        latitude: 10.7750,
        longitude: 106.7000,
        address: '50 Đông Du, Q.1, TP.HCM',
        tags: ['bar', 'rooftop', 'cocktail'],
        image: 'https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=500&h=500&fit=crop',
      },
      {
        title: 'Karaoke King',
        description: 'Quán karaoke lớn với phòng VIP và âm thanh chất lượng cao',
        latitude: 10.7680,
        longitude: 106.6950,
        address: '100 Nguyễn Huệ, Q.1, TP.HCM',
        tags: ['karaoke', 'entertainment', 'fun'],
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop',
      },
      {
        title: 'Sunset Club',
        description: 'Quán bar với view hoàng hôn tuyệt đẹp trên sông Sài Gòn',
        latitude: 10.7720,
        longitude: 106.6880,
        address: '15 Tôn Đức Thắng, Q.1, TP.HCM',
        tags: ['bar', 'sunset', 'riverside'],
        image: 'https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=500&h=500&fit=crop',
      },
    ],
  },
  {
    category: 'shopping',
    places: [
      {
        title: 'Saigon Square',
        description: 'Trung tâm mua sắm với hàng hiệu và giá cả cạnh tranh',
        latitude: 10.7700,
        longitude: 106.6850,
        address: '65 Lý Tự Trọng, Q.1, TP.HCM',
        tags: ['shopping', 'mall', 'fashion'],
        image: 'https://images.unsplash.com/photo-1555529669-e69e7f0acec8?w=500&h=500&fit=crop',
      },
      {
        title: 'Bến Thành Market',
        description: 'Chợ truyền thống với đa dạng hàng hóa và đặc sản địa phương',
        latitude: 10.7720,
        longitude: 106.6980,
        address: 'Chợ Bến Thành, Q.1, TP.HCM',
        tags: ['market', 'traditional', 'souvenirs'],
        image: 'https://images.unsplash.com/photo-1555529669-e69e7f0acec8?w=500&h=500&fit=crop',
      },
      {
        title: 'Vincom Center',
        description: 'Trung tâm thương mại hiện đại với các thương hiệu quốc tế',
        latitude: 10.7760,
        longitude: 106.7020,
        address: '72 Lê Thánh Tôn, Q.1, TP.HCM',
        tags: ['shopping', 'mall', 'luxury'],
        image: 'https://images.unsplash.com/photo-1555529669-e69e7f0acec8?w=500&h=500&fit=crop',
      },
      {
        title: 'Takashimaya',
        description: 'Cửa hàng bách hóa cao cấp với hàng hóa chất lượng',
        latitude: 10.7740,
        longitude: 106.7010,
        address: '68 Ngô Tất Tố, Q.1, TP.HCM',
        tags: ['shopping', 'department-store', 'premium'],
        image: 'https://images.unsplash.com/photo-1555529669-e69e7f0acec8?w=500&h=500&fit=crop',
      },
    ],
  },
  {
    category: 'historic',
    places: [
      {
        title: 'Dinh Độc Lập',
        description: 'Dinh Độc Lập - biểu tượng lịch sử của Việt Nam',
        latitude: 10.7810,
        longitude: 106.6930,
        address: '135 Nguyễn Huệ, Q.1, TP.HCM',
        tags: ['historic', 'monument', 'museum'],
        image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=500&fit=crop',
      },
      {
        title: 'Bảo Tàng Tao Đàn',
        description: 'Bảo tàng với các hiện vật lịch sử quý giá',
        latitude: 10.7800,
        longitude: 106.7050,
        address: 'Tao Đàn, Q.1, TP.HCM',
        tags: ['museum', 'historic', 'culture'],
        image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=500&fit=crop',
      },
      {
        title: 'Hội An Ancient Town',
        description: 'Phố cổ Hội An với kiến trúc truyền thống Việt Nam',
        latitude: 15.8800,
        longitude: 108.3300,
        address: 'Hội An, Quảng Nam',
        tags: ['historic', 'ancient', 'architecture'],
        image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=500&fit=crop',
      },
      {
        title: 'Huế Imperial Citadel',
        description: 'Kinh thành Huế với kiến trúc hoàng gia độc đáo',
        latitude: 16.4700,
        longitude: 107.5900,
        address: 'Huế, Thừa Thiên Huế',
        tags: ['historic', 'imperial', 'architecture'],
        image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=500&fit=crop',
      },
    ],
  },
  {
    category: 'beach',
    places: [
      {
        title: 'Vũng Tàu Beach',
        description: 'Bãi biển đẹp với cát trắng và nước xanh',
        latitude: 10.2300,
        longitude: 107.0600,
        address: 'Vũng Tàu, Bà Rịa - Vũng Tàu',
        tags: ['beach', 'sea', 'resort'],
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=500&fit=crop',
      },
      {
        title: 'Nha Trang Beach',
        description: 'Bãi biển nổi tiếng với cảnh quan tuyệt đẹp',
        latitude: 12.2500,
        longitude: 109.1900,
        address: 'Nha Trang, Khánh Hòa',
        tags: ['beach', 'sea', 'tourist'],
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=500&fit=crop',
      },
      {
        title: 'Mũi Né Beach',
        description: 'Bãi biển yên tĩnh với cát trắng mịn',
        latitude: 11.9300,
        longitude: 108.2600,
        address: 'Mũi Né, Bình Thuận',
        tags: ['beach', 'sea', 'peaceful'],
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=500&fit=crop',
      },
      {
        title: 'Cô Tô Island',
        description: 'Đảo Cô Tô với bãi biển hoang sơ và thiên nhiên nguyên sơ',
        latitude: 20.9200,
        longitude: 106.3800,
        address: 'Cô Tô, Quảng Ninh',
        tags: ['beach', 'island', 'nature'],
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=500&fit=crop',
      },
    ],
  },
];

export async function seedPlaces(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const placeRepository = dataSource.getRepository(Place);
  const placeImageRepository = dataSource.getRepository(PlaceImage);

  // Create a demo user
  let demoUser = await userRepository.findOne({
    where: { email: 'demo@example.com' },
  });

  if (!demoUser) {
    demoUser = userRepository.create({
      username: 'demo_user',
      email: 'demo@example.com',
      password: await bcrypt.hash('demo123456', 10),
      avatar_url: 'https://i.pravatar.cc/150?img=1',
    });
    await userRepository.save(demoUser);
    console.log('✓ Created demo user');
  }

  // Seed places
  for (const categoryData of seedData) {
    for (const placeData of categoryData.places) {
      const existingPlace = await placeRepository.findOne({
        where: { title: placeData.title },
      });

      let savedPlace = existingPlace;

      if (!existingPlace) {
        const place = placeRepository.create({
          user_id: demoUser.id,
          title: placeData.title,
          description: placeData.description,
          category: categoryData.category,
          latitude: placeData.latitude,
          longitude: placeData.longitude,
          address: placeData.address,
          tags: placeData.tags,
          is_published: true,
        });

        savedPlace = await placeRepository.save(place);

        console.log(`? Created place: ${placeData.title}`);
      }

      if (savedPlace) {
        const existingImage = await placeImageRepository.findOne({
          where: { place_id: savedPlace.id, order_idx: 0 },
        });

        if (existingImage) {
          if (existingImage.url !== placeData.image) {
            await placeImageRepository.update(existingImage.id, {
              url: placeData.image,
            });
          }
        } else {
          await placeImageRepository.save(
            placeImageRepository.create({
              place_id: savedPlace.id,
              url: placeData.image,
              order_idx: 0,
            }),
          );
          console.log(`? Added image: ${placeData.title}`);
        }
      }
    }
  }

  console.log('✓ Seeding completed!');
}
