import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { placesAPI } from "../services/api";

// ===== MOCK DATA (fallback when API not available) =====
const MOCK_PLACES = [
  // CAFE CATEGORY (4 places)
  {
    id: "1",
    title: "Quán Cà Phê Hideout",
    description: "Quán cà phê nhỏ ẩn mình trong con hẻm yên tĩnh, phong cách vintage cực chill",
    category: "cafe",
    latitude: 10.7769,
    longitude: 106.7009,
    address: "123 Nguyễn Huệ, Q1, TP.HCM",
    tags: ["vintage", "chill", "yên tĩnh"],
    like_count: 234,
    comment_count: 45,
    bookmark_count: 89,
    created_at: "2025-01-15T10:00:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1495474472645-4d71bcdd2085?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u1", username: "coffeeaddict", avatar_url: "https://i.pravatar.cc/150?img=1" },
  },
  {
    id: "1a",
    title: "Cà Phê Sáng Tạo",
    description: "Quán cà phê với không gian sáng tạo, có workshop vẽ tranh mỗi tuần",
    category: "cafe",
    latitude: 10.7745,
    longitude: 106.7025,
    address: "456 Ngô Đức Kế, Q1, TP.HCM",
    tags: ["creative", "workshop", "art"],
    like_count: 312,
    comment_count: 52,
    bookmark_count: 125,
    created_at: "2025-02-10T09:30:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u1a", username: "artcafe", avatar_url: "https://i.pravatar.cc/150?img=10" },
  },
  {
    id: "1b",
    title: "Espresso Corner",
    description: "Quán cà phê chuyên về espresso, barista giỏi, latte art đẹp mê",
    category: "cafe",
    latitude: 10.7800,
    longitude: 106.6980,
    address: "789 Lê Lợi, Q1, TP.HCM",
    tags: ["espresso", "barista", "specialty"],
    like_count: 456,
    comment_count: 68,
    bookmark_count: 178,
    created_at: "2025-02-20T08:00:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u1b", username: "espressopro", avatar_url: "https://i.pravatar.cc/150?img=11" },
  },
  {
    id: "1c",
    title: "Cà Phê Truyền Thống",
    description: "Cà phê kiểu Việt cổ điển, phục vụ cà phê đen, cà phê sữa ngon lắm",
    category: "cafe",
    latitude: 10.7850,
    longitude: 106.7050,
    address: "321 Pasteur, Q3, TP.HCM",
    tags: ["traditional", "vietnamese", "classic"],
    like_count: 523,
    comment_count: 75,
    bookmark_count: 210,
    created_at: "2025-03-05T07:00:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u1c", username: "vietnamcoffee", avatar_url: "https://i.pravatar.cc/150?img=12" },
  },
  // PHOTO CATEGORY (4 places)
  {
    id: "2",
    title: "Góc Chụp Ảnh Sunset Hill",
    description: "View hoàng hôn tuyệt đẹp trên đồi, ít người biết. Cứ chiều là vàng rực cả trời!",
    category: "photo",
    latitude: 10.8231,
    longitude: 106.6297,
    address: "Đồi Sunset, Thủ Đức",
    tags: ["sunset", "view đẹp", "chụp ảnh"],
    like_count: 567,
    comment_count: 78,
    bookmark_count: 200,
    created_at: "2025-02-01T14:30:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u2", username: "photohunter", avatar_url: "https://i.pravatar.cc/150?img=2" },
  },
  {
    id: "2a",
    title: "Phố Cổ Hội An",
    description: "Phố cổ Hội An với kiến trúc cổ kính, đèn lồng rực rỡ, lý tưởng chụp ảnh",
    category: "photo",
    latitude: 15.8801,
    longitude: 108.3384,
    address: "Phố Cổ, Hội An, Quảng Nam",
    tags: ["ancient", "lanterns", "architecture"],
    like_count: 789,
    comment_count: 95,
    bookmark_count: 312,
    created_at: "2025-02-15T17:00:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u2a", username: "hoianphotographer", avatar_url: "https://i.pravatar.cc/150?img=13" },
  },
  {
    id: "2b",
    title: "Cầu Vàng Đà Nẵng",
    description: "Cầu Vàng nổi tiếng với tượng tay khổng lồ, view núi đẹp, check-in cực hot",
    category: "photo",
    latitude: 15.9773,
    longitude: 108.0194,
    address: "Cầu Vàng, Đà Nẵng",
    tags: ["golden bridge", "landmark", "scenic"],
    like_count: 1200,
    comment_count: 156,
    bookmark_count: 450,
    created_at: "2025-02-25T16:30:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u2b", username: "danangexplorer", avatar_url: "https://i.pravatar.cc/150?img=14" },
  },
  {
    id: "2c",
    title: "Chợ Nổi Cái Bè",
    description: "Chợ nổi trên sông với những chiếc thuyền đầy hoa quả, cảnh sắc sinh động",
    category: "photo",
    latitude: 10.2769,
    longitude: 105.7905,
    address: "Chợ Nổi Cái Bè, Tiền Giang",
    tags: ["floating market", "river", "colorful"],
    like_count: 654,
    comment_count: 82,
    bookmark_count: 245,
    created_at: "2025-03-08T06:00:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u2c", username: "mekongtraveler", avatar_url: "https://i.pravatar.cc/150?img=15" },
  },
  // FOOD CATEGORY (4 places)
  {
    id: "3",
    title: "Bún Bò Cô Ba",
    description: "Bún bò Huế chuẩn vị, đậm đà nước dùng. Giá rẻ mà chất lượng, chỉ dân local mới biết",
    category: "food",
    latitude: 10.7821,
    longitude: 106.6948,
    address: "45 Phan Đình Phùng, Phú Nhuận",
    tags: ["bún bò", "Huế", "ẩm thực"],
    like_count: 890,
    comment_count: 120,
    bookmark_count: 340,
    created_at: "2025-03-10T08:00:00Z",
    is_liked: true,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u3", username: "foodielover", avatar_url: "https://i.pravatar.cc/150?img=3" },
  },
  {
    id: "3a",
    title: "Phở Tây Hồ",
    description: "Phở Hà Nội chuẩn vị, nước dùng nấu từ xương bò suốt 12 tiếng, cực ngon",
    category: "food",
    latitude: 10.7900,
    longitude: 106.6850,
    address: "78 Tây Hồ, Q Tây Hồ, TP.HCM",
    tags: ["phở", "hanoi style", "broth"],
    like_count: 756,
    comment_count: 98,
    bookmark_count: 289,
    created_at: "2025-03-12T07:00:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u3a", username: "phomaster", avatar_url: "https://i.pravatar.cc/150?img=16" },
  },
  {
    id: "3b",
    title: "Bánh Mì Sài Gòn",
    description: "Bánh mì Sài Gòn với pâté, chả, dưa chuối, giòn tan, ăn sáng tuyệt vời",
    category: "food",
    latitude: 10.7750,
    longitude: 106.6950,
    address: "123 Nguyễn Hữu Cảnh, Q1, TP.HCM",
    tags: ["bánh mì", "breakfast", "street food"],
    like_count: 634,
    comment_count: 76,
    bookmark_count: 198,
    created_at: "2025-03-15T06:30:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1555939594-58d7cb561404?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u3b", username: "banh_mi_lover", avatar_url: "https://i.pravatar.cc/150?img=17" },
  },
  {
    id: "3c",
    title: "Cơm Tấm Sài Gòn",
    description: "Cơm tấm với sườn nướng, trứng ốp la, nước mắm chua cay, ăn trưa ngon",
    category: "food",
    latitude: 10.7680,
    longitude: 106.7100,
    address: "456 Võ Văn Kiệt, Q1, TP.HCM",
    tags: ["cơm tấm", "lunch", "vietnamese"],
    like_count: 512,
    comment_count: 64,
    bookmark_count: 167,
    created_at: "2025-03-18T11:30:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u3c", username: "comtam_addict", avatar_url: "https://i.pravatar.cc/150?img=18" },
  },
  // NATURE CATEGORY (4 places)
  {
    id: "4",
    title: "Vườn Bí Mật Garden",
    description: "Khu vườn nhỏ giữa phố đông, có hồ cá koi và cầu gỗ. Lý tưởng để đọc sách",
    category: "nature",
    latitude: 10.79,
    longitude: 106.68,
    address: "Hẻm 88 Nguyễn Trãi, Q5",
    tags: ["thiên nhiên", "yên bình", "đọc sách"],
    like_count: 445,
    comment_count: 60,
    bookmark_count: 180,
    created_at: "2025-03-15T09:00:00Z",
    is_liked: false,
    is_bookmarked: true,
    images: [{ url: "https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u4", username: "naturelover", avatar_url: "https://i.pravatar.cc/150?img=4" },
  },
  {
    id: "4a",
    title: "Công Viên Tao Đàn",
    description: "Công viên xanh giữa thành phố, có hồ nước, cây cối, lý tưởng chạy bộ",
    category: "nature",
    latitude: 10.7850,
    longitude: 106.6900,
    address: "Công Viên Tao Đàn, Q4, TP.HCM",
    tags: ["park", "green", "jogging"],
    like_count: 378,
    comment_count: 48,
    bookmark_count: 142,
    created_at: "2025-03-20T06:00:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u4a", username: "parkrunner", avatar_url: "https://i.pravatar.cc/150?img=19" },
  },
  {
    id: "4b",
    title: "Vườn Quốc Gia Cát Tiên",
    description: "Vườn quốc gia với rừng nguyên sinh, động vật hoang dã, trekking tuyệt vời",
    category: "nature",
    latitude: 11.4167,
    longitude: 107.1667,
    address: "Vườn Quốc Gia Cát Tiên, Đồng Nai",
    tags: ["national park", "wildlife", "trekking"],
    like_count: 823,
    comment_count: 112,
    bookmark_count: 356,
    created_at: "2025-03-25T08:00:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u4b", username: "naturetrekker", avatar_url: "https://i.pravatar.cc/150?img=20" },
  },
  {
    id: "4c",
    title: "Hồ Tây Hà Nội",
    description: "Hồ Tây lớn nhất Hà Nội, view đẹp, có đường đi bộ quanh hồ, lý tưởng buổi sáng",
    category: "nature",
    latitude: 21.0865,
    longitude: 105.8581,
    address: "Hồ Tây, Hà Nội",
    tags: ["lake", "scenic", "walking"],
    like_count: 567,
    comment_count: 74,
    bookmark_count: 213,
    created_at: "2025-03-28T05:30:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u4c", username: "hanoilover", avatar_url: "https://i.pravatar.cc/150?img=21" },
  },
  // ART CATEGORY (4 places)
  {
    id: "5",
    title: "Street Art Alley",
    description: "Con hẻm đầy graffiti và tranh tường nghệ thuật. Check-in cực chất!",
    category: "art",
    latitude: 10.775,
    longitude: 106.692,
    address: "Hẻm 47 Phạm Ngũ Lão, Q1",
    tags: ["graffiti", "nghệ thuật", "check-in"],
    like_count: 320,
    comment_count: 35,
    bookmark_count: 110,
    created_at: "2025-03-20T11:00:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u5", username: "artlover", avatar_url: "https://i.pravatar.cc/150?img=5" },
  },
  {
    id: "5a",
    title: "Bảo Tàng Mỹ Thuật",
    description: "Bảo tàng mỹ thuật với các tác phẩm của các nghệ sĩ Việt Nam nổi tiếng",
    category: "art",
    latitude: 10.7850,
    longitude: 106.6950,
    address: "97A Phó Đức Chính, Q1, TP.HCM",
    tags: ["museum", "art", "vietnamese"],
    like_count: 456,
    comment_count: 62,
    bookmark_count: 189,
    created_at: "2025-03-22T10:00:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u5a", username: "artmuseum", avatar_url: "https://i.pravatar.cc/150?img=22" },
  },
  {
    id: "5b",
    title: "Phố Tranh Tường Bến Thành",
    description: "Phố tranh tường với các bức vẽ lớn, đẹp, lý tưởng chụp ảnh",
    category: "art",
    latitude: 10.7700,
    longitude: 106.6980,
    address: "Phố Tranh Tường, Bến Thành, Q1",
    tags: ["mural", "street art", "photography"],
    like_count: 534,
    comment_count: 71,
    bookmark_count: 224,
    created_at: "2025-03-24T14:00:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u5b", username: "muralhunter", avatar_url: "https://i.pravatar.cc/150?img=23" },
  },
  {
    id: "5c",
    title: "Không Gian Sáng Tạo Artspace",
    description: "Không gian sáng tạo với các workshop vẽ, điêu khắc, trang trí",
    category: "art",
    latitude: 10.7900,
    longitude: 106.7000,
    address: "123 Nguyễn Thị Minh Khai, Q3, TP.HCM",
    tags: ["creative space", "workshop", "art"],
    like_count: 389,
    comment_count: 51,
    bookmark_count: 156,
    created_at: "2025-03-26T13:00:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u5c", username: "artspace", avatar_url: "https://i.pravatar.cc/150?img=24" },
  },
  // NIGHTLIFE CATEGORY (4 places)
  {
    id: "6",
    title: "Rooftop Bar Secret",
    description: "Bar trên sân thượng view toàn thành phố. Cocktail ngon, nhạc chill, vibe hoàn hảo",
    category: "nightlife",
    latitude: 10.781,
    longitude: 106.705,
    address: "100 Nguyễn Thị Minh Khai, Q3",
    tags: ["rooftop", "cocktail", "nightlife"],
    like_count: 610,
    comment_count: 90,
    bookmark_count: 250,
    created_at: "2025-04-01T19:00:00Z",
    is_liked: true,
    is_bookmarked: true,
    images: [{ url: "https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u6", username: "nightowl", avatar_url: "https://i.pravatar.cc/150?img=6" },
  },
  {
    id: "6a",
    title: "Club Nhạc Sống Livemusic",
    description: "Quán bar với nhạc sống mỗi tối, DJ chuyên nghiệp, vibe sôi động",
    category: "nightlife",
    latitude: 10.7750,
    longitude: 106.7050,
    address: "234 Nguyễn Huệ, Q1, TP.HCM",
    tags: ["live music", "club", "dj"],
    like_count: 723,
    comment_count: 105,
    bookmark_count: 287,
    created_at: "2025-04-02T20:00:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u6a", username: "livemusic_fan", avatar_url: "https://i.pravatar.cc/150?img=25" },
  },
  {
    id: "6b",
    title: "Karaoke Vui Vẻ",
    description: "Karaoke với phòng riêng, âm thanh tốt, có đồ ăn vặt, vui vẻ với bạn bè",
    category: "nightlife",
    latitude: 10.7800,
    longitude: 106.6950,
    address: "567 Lê Lợi, Q1, TP.HCM",
    tags: ["karaoke", "private room", "fun"],
    like_count: 456,
    comment_count: 68,
    bookmark_count: 178,
    created_at: "2025-04-03T21:00:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u6b", username: "karaoke_lover", avatar_url: "https://i.pravatar.cc/150?img=26" },
  },
  {
    id: "6c",
    title: "Beer Garden Sài Gòn",
    description: "Vườn bia ngoài trời, bia lạnh, đồ nướng ngon, không khí vui vẻ",
    category: "nightlife",
    latitude: 10.7850,
    longitude: 106.7100,
    address: "789 Pasteur, Q3, TP.HCM",
    tags: ["beer garden", "bbq", "outdoor"],
    like_count: 534,
    comment_count: 79,
    bookmark_count: 201,
    created_at: "2025-04-04T18:30:00Z",
    is_liked: false,
    is_bookmarked: false,
    images: [{ url: "https://images.unsplash.com/photo-1608270861620-7476ffd00d4d?w=500&h=300&fit=crop", order_idx: 0 }],
    user: { id: "u6c", username: "beergarden_fan", avatar_url: "https://i.pravatar.cc/150?img=27" },
  },
];

export type Place = (typeof MOCK_PLACES)[0];

function updateCachedPlace(
  queryClient: ReturnType<typeof useQueryClient>,
  placeId: string,
  updater: (place: Place) => Place,
) {
  const updatePlace = (place: Place) =>
    place.id === placeId ? updater(place) : place;

  queryClient.setQueryData(["place", placeId], (oldData: Place | undefined) =>
    oldData ? updater(oldData) : oldData,
  );

  queryClient.setQueriesData({ queryKey: ["places"] }, (oldData: any) => {
    if (!oldData) return oldData;

    if (Array.isArray(oldData)) {
      return oldData.map(updatePlace);
    }

    if (oldData.pages) {
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          places: Array.isArray(page.places) ? page.places.map(updatePlace) : page.places,
        })),
      };
    }

    if (Array.isArray(oldData.data)) {
      return {
        ...oldData,
        data: oldData.data.map(updatePlace),
      };
    }

    return oldData;
  });
}

// Fetch places with infinite scroll pagination
export function usePlacesInfinite(params?: {
  category?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: ["places", "infinite", params],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        // If location params provided, use nearby API
        if (params?.lat && params?.lng) {
          const response = await placesAPI.getNearby(
            params.lat,
            params.lng,
            params.radius || 5,
          );
          // Backend returns { data: [...], meta: {...} } wrapped in axios { data: ... }
          const responseData = response.data;
          let result = (responseData?.data || responseData) as Place[];
          if (params.category) {
            result = result.filter((p) => p.category === params.category);
          }
          return {
            places: result,
            nextPage: undefined, // Nearby doesn't paginate
          };
        }

        // Otherwise use regular getAll
        const response = await placesAPI.getAll({
          category: params?.category,
          page: pageParam,
        });
        // Backend returns { data: [...], meta: {...} }
        const responseData = response.data;
        const places = (responseData?.data || responseData) as Place[];
        const meta = responseData?.meta;
        return {
          places,
          nextPage: meta?.page < meta?.totalPages ? pageParam + 1 : undefined,
        };
      } catch (error) {
        if (!__DEV__) throw error;
        // Fallback to mock data with simulated pagination
        let result = [...MOCK_PLACES];
        if (params?.category) {
          result = result.filter((p) => p.category === params.category);
        }
        
        // If no category selected, return all places without pagination
        if (!params?.category) {
          return {
            places: result,
            nextPage: undefined,
          };
        }
        
        const limit = params?.limit || 10;
        const start = (pageParam - 1) * limit;
        const paginatedData = result.slice(start, start + limit);
        return {
          places: paginatedData,
          nextPage: paginatedData.length === limit ? pageParam + 1 : undefined,
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 2 * 60 * 1000,
  });
}

// Fetch places with filters
export function usePlaces(params?: { category?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["places", params],
    queryFn: async () => {
      try {
        const response = await placesAPI.getAll(params);
        // Backend returns { data: [...], meta: {...} }
        const responseData = response.data;
        return (responseData?.data || responseData) as Place[];
      } catch (error) {
        if (!__DEV__) throw error;
        // Fallback to mock data
        let result = [...MOCK_PLACES];
        if (params?.category) {
          result = result.filter((p) => p.category === params.category);
        }
        return result;
      }
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Fetch single place detail
export function usePlaceDetail(placeId: string | undefined) {
  return useQuery({
    queryKey: ["place", placeId],
    queryFn: async () => {
      try {
        const { data } = await placesAPI.getById(placeId!);
        return data as Place & {
          description: string;
          images: { url: string | null; order_idx: number }[];
        };
      } catch (error) {
        if (!__DEV__) throw error;
        const mock = MOCK_PLACES.find((p) => p.id === placeId);
        return mock || MOCK_PLACES[0];
      }
    },
    enabled: !!placeId,
  });
}

// Fetch nearby places for map
export function useNearbyPlaces(lat?: number, lng?: number, radius?: number) {
  return useQuery({
    queryKey: ["places", "nearby", lat, lng, radius],
    queryFn: async () => {
      try {
        const response = await placesAPI.getNearby(lat!, lng!, radius);
        const responseData = response.data;
        return (responseData?.data || responseData) as Place[];
      } catch (error) {
        if (!__DEV__) throw error;
        return MOCK_PLACES;
      }
    },
    enabled: !!lat && !!lng,
  });
}

// Fetch user's places (for profile)
export function useUserPlaces(userId?: string) {
  return useQuery({
    queryKey: ["places", "user", userId],
    queryFn: async () => {
      try {
        const response = await placesAPI.getUserPlaces(userId!);
        const responseData = response.data;
        return (responseData?.data || responseData) as Place[];
      } catch (error) {
        if (!__DEV__) throw error;
        return MOCK_PLACES.slice(0, 3);
      }
    },
    enabled: !!userId,
  });
}

// Toggle like mutation
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeId: string) => placesAPI.toggleLike(placeId),
    onMutate: async (placeId: string) => {
      await queryClient.cancelQueries({ queryKey: ["places"] });
      await queryClient.cancelQueries({ queryKey: ["place", placeId] });

      updateCachedPlace(queryClient, placeId, (place) => {
        const isLiked = !!place.is_liked;
        return {
          ...place,
          is_liked: !isLiked,
          like_count: Math.max((place.like_count || 0) + (isLiked ? -1 : 1), 0),
        };
      });
    },
    onSuccess: (response, placeId) => {
      const result = response.data;
      updateCachedPlace(queryClient, placeId, (place) => ({
        ...place,
        is_liked: result.liked,
        like_count: result.like_count,
      }));
    },
    onError: (_error, placeId) => {
      queryClient.invalidateQueries({ queryKey: ["place", placeId] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
    onSettled: (_data, _error, placeId) => {
      queryClient.invalidateQueries({ queryKey: ["place", placeId] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });
}

// Create place mutation
export function useCreatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => placesAPI.create(formData),
    onSuccess: async (response: any) => {
      const newPlace = response?.data ?? response;

      if (newPlace?.id) {
        queryClient.setQueryData(["place", newPlace.id], newPlace);
      }
      
      // Add the new place to loaded feed pages immediately while refetch catches up.
      queryClient.setQueriesData(
        { queryKey: ["places", "infinite"] },
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: [
              {
                places: [newPlace, ...(oldData.pages[0]?.places || [])],
                nextPage: oldData.pages[0]?.nextPage,
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["places"] }),
        queryClient.invalidateQueries({ queryKey: ["place"] }),
        queryClient.invalidateQueries({ queryKey: ["search"] }),
      ]);
    },
  });
}

// Toggle bookmark mutation
export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeId: string) => placesAPI.toggleBookmark(placeId),
    onMutate: async (placeId: string) => {
      // Optimistic update on place lists
      await queryClient.cancelQueries({ queryKey: ["places"] });

      const queries = queryClient.getQueriesData<Place[]>({
        queryKey: ["places"],
      });
      queries.forEach(([queryKey, oldData]) => {
        if (Array.isArray(oldData)) {
          queryClient.setQueryData(
            queryKey,
            oldData.map((p) =>
              p.id === placeId
                ? {
                    ...p,
                    is_bookmarked: !p.is_bookmarked,
                    bookmark_count: p.is_bookmarked
                      ? p.bookmark_count - 1
                      : p.bookmark_count + 1,
                  }
                : p,
            ),
          );
        }
      });

      // Optimistic update on place detail
      const detailData = queryClient.getQueryData<Place>(["place", placeId]);
      if (detailData) {
        queryClient.setQueryData(["place", placeId], {
          ...detailData,
          is_bookmarked: !detailData.is_bookmarked,
          bookmark_count: detailData.is_bookmarked
            ? detailData.bookmark_count - 1
            : detailData.bookmark_count + 1,
        });
      }
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });
}

// Delete place mutation
export function useDeletePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeId: string) => placesAPI.delete(placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });
}
