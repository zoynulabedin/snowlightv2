import { useState } from "react";
import {
  Star,
  ThumbsUp,
  MessageCircle,
  Calendar,
  User,
  Filter,
  Search,
} from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import Layout from "../components/Layout";

interface Review {
  id: string;
  albumId: string;
  albumTitle: string;
  albumArtist: string;
  albumCover: string;
  reviewTitle: string;
  reviewContent: string;
  rating: number;
  author: string;
  authorAvatar: string;
  publishDate: string;
  likes: number;
  comments: number;
  tags: string[];
}

export default function ReviewsPage() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock review data
  const reviews: Review[] = [
    {
      id: "1",
      albumId: "album1",
      albumTitle: "Golden",
      albumArtist: "HUNTR/X",
      albumCover: "/api/placeholder/300/300",
      reviewTitle: "완벽한 K-POP 사운드의 진화",
      reviewContent:
        "HUNTR/X의 새 앨범 Golden은 K-POP의 새로운 가능성을 보여주는 작품입니다. 타이틀곡부터 수록곡까지 모든 트랙이 완성도 높은 프로덕션과 감각적인 멜로디로 가득합니다. 특히 보컬의 표현력과 랩의 조화가 인상적이며, 전체적인 앨범의 흐름도 매우 자연스럽습니다.",
      rating: 5,
      author: "음악평론가 김민수",
      authorAvatar: "/api/placeholder/40/40",
      publishDate: "2025-08-08",
      likes: 124,
      comments: 23,
      tags: ["K-POP", "Electronic", "Dance"],
    },
    {
      id: "2",
      albumId: "album2",
      albumTitle: "Soda Pop",
      albumArtist: "Saja Boys",
      albumCover: "/api/placeholder/300/300",
      reviewTitle: "청량감 넘치는 여름 앨범",
      reviewContent:
        "Saja Boys의 Soda Pop은 제목 그대로 시원하고 청량한 느낌의 앨범입니다. 여름에 듣기 좋은 트랙들로 구성되어 있으며, 특히 멜로디 라인이 매우 중독성 있습니다. 다만 일부 트랙에서는 좀 더 다양한 시도가 있었으면 하는 아쉬움이 남습니다.",
      rating: 4,
      author: "리뷰어 박지영",
      authorAvatar: "/api/placeholder/40/40",
      publishDate: "2025-08-07",
      likes: 89,
      comments: 15,
      tags: ["Pop", "Summer", "Refreshing"],
    },
    {
      id: "3",
      albumId: "album3",
      albumTitle: "뛰어(JUMP)",
      albumArtist: "BLACKPINK",
      albumCover: "/api/placeholder/300/300",
      reviewTitle: "BLACKPINK의 새로운 도전",
      reviewContent:
        "BLACKPINK의 새 싱글 뛰어(JUMP)는 그들의 음악적 성장을 보여주는 작품입니다. 기존의 강렬한 이미지에서 벗어나 좀 더 다채로운 모습을 보여주며, 각 멤버의 개성이 잘 드러나는 곡입니다. 프로덕션 퀄리티도 매우 높아 글로벌 팬들에게 어필할 수 있을 것 같습니다.",
      rating: 5,
      author: "K-POP 전문가 이수진",
      authorAvatar: "/api/placeholder/40/40",
      publishDate: "2025-08-06",
      likes: 256,
      comments: 45,
      tags: ["K-POP", "Girl Group", "Experimental"],
    },
    {
      id: "4",
      albumId: "album4",
      albumTitle: "FAMOUS",
      albumArtist: "ALLDAY PROJECT",
      albumCover: "/api/placeholder/300/300",
      reviewTitle: "힙합의 새로운 바람",
      reviewContent:
        "ALLDAY PROJECT의 FAMOUS는 한국 힙합 씬에 새로운 바람을 불러일으키는 앨범입니다. 트랩 비트와 멜로딕한 요소가 절묘하게 조화를 이루며, 가사의 메시지도 매우 강렬합니다. 특히 프로듀싱 면에서 해외 트렌드를 잘 반영하면서도 한국적인 색깔을 잃지 않았습니다.",
      rating: 4,
      author: "힙합 칼럼니스트 정태현",
      authorAvatar: "/api/placeholder/40/40",
      publishDate: "2025-08-05",
      likes: 178,
      comments: 32,
      tags: ["Hip-Hop", "Trap", "Korean"],
    },
  ];

  const categories = [
    {
      id: "all",
      name: t("reviews.categories.all", "전체"),
      count: reviews.length,
    },
    { id: "kpop", name: t("reviews.categories.kpop", "K-POP"), count: 2 },
    { id: "pop", name: t("reviews.categories.pop", "POP"), count: 1 },
    { id: "hiphop", name: t("reviews.categories.hiphop", "HIP-HOP"), count: 1 },
    { id: "rock", name: t("reviews.categories.rock", "ROCK"), count: 0 },
    { id: "rnb", name: t("reviews.categories.rnb", "R&B"), count: 0 },
  ];

  const sortOptions = [
    { id: "latest", name: t("reviews.sort.latest", "최신순") },
    { id: "popular", name: t("reviews.sort.popular", "인기순") },
    { id: "rating", name: t("reviews.sort.rating", "평점순") },
    { id: "comments", name: t("reviews.sort.comments", "댓글순") },
  ];

  const filteredReviews = reviews.filter((review) => {
    if (selectedCategory !== "all") {
      const hasCategory = review.tags.some(
        (tag) =>
          tag.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          (selectedCategory === "kpop" && tag.toLowerCase() === "k-pop")
      );
      if (!hasCategory) return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        review.albumTitle.toLowerCase().includes(query) ||
        review.albumArtist.toLowerCase().includes(query) ||
        review.reviewTitle.toLowerCase().includes(query) ||
        review.author.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.likes - a.likes;
      case "rating":
        return b.rating - a.rating;
      case "comments":
        return b.comments - a.comments;
      case "latest":
      default:
        return (
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        );
    }
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("reviews.title", "추천 앨범 리뷰")}
          </h1>
          <p className="text-gray-600">
            {t(
              "reviews.description",
              "음악 전문가들이 추천하는 앨범 리뷰를 만나보세요"
            )}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t(
                  "reviews.searchPlaceholder",
                  "앨범, 아티스트, 리뷰 제목 검색..."
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-Snowlight-pink text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Album Info */}
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={review.albumCover}
                    alt={review.albumTitle}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {review.albumTitle}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {review.albumArtist}
                    </p>
                    <div className="flex items-center mt-1">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-600">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {review.reviewTitle}
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {review.reviewContent}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {review.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Author and Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <img
                      src={review.authorAvatar}
                      alt={review.author}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {review.author}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(review.publishDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {review.likes}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {review.comments}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedReviews.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("reviews.noResults", "검색 결과가 없습니다")}
            </h3>
            <p className="text-gray-600">
              {t(
                "reviews.noResultsDescription",
                "다른 검색어나 필터를 시도해보세요"
              )}
            </p>
          </div>
        )}

        {/* Load More */}
        {sortedReviews.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
              {t("reviews.loadMore", "더 많은 리뷰 보기")}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
