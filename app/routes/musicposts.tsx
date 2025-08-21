import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import {
  Calendar,
  User,
  Eye,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export const meta: MetaFunction = () => {
  return [
    { title: "뮤직포스트 - 벅스" },
    {
      name: "description",
      content: "음악에 대한 다양한 이야기와 소식을 만나보세요",
    },
  ];
};

export default function MusicPosts() {
  const { t } = useLanguage();

  const posts = [
    {
      id: "1",
      title: "2025년 상반기 K-POP 트렌드 분석",
      excerpt:
        "올해 상반기 K-POP 시장의 주요 트렌드와 변화를 분석해보았습니다. 글로벌 시장에서의 K-POP의 위상과 새로운 아티스트들의 등장...",
      author: "벅스 에디터",
      date: "2025.08.08",
      category: "트렌드",
      views: 15420,
      likes: 892,
      comments: 156,
      thumbnail: "https://placehold.co/400x250/ff1493/ffffff?text=KPOP+Trend",
      featured: true,
    },
    {
      id: "2",
      title: "인디 음악의 새로운 바람, 주목해야 할 신예 아티스트 10팀",
      excerpt:
        "최근 인디 씬에서 주목받고 있는 신예 아티스트들을 소개합니다. 각자만의 독특한 색깔과 음악적 개성을 가진 아티스트들의 이야기...",
      author: "음악 칼럼니스트 김OO",
      date: "2025.08.07",
      category: "아티스트",
      views: 8930,
      likes: 445,
      comments: 89,
      thumbnail:
        "https://placehold.co/400x250/8b5cf6/ffffff?text=Indie+Artists",
      featured: false,
    },
    {
      id: "3",
      title: "여름 페스티벌 시즌, 놓치면 안 될 공연 라인업",
      excerpt:
        "올여름 전국 각지에서 열리는 음악 페스티벌들의 라인업을 정리했습니다. 록부터 일렉트로닉까지 다양한 장르의 아티스트들이...",
      author: "페스티벌 전문 기자",
      date: "2025.08.06",
      category: "페스티벌",
      views: 12340,
      likes: 678,
      comments: 234,
      thumbnail: "https://placehold.co/400x250/f59e0b/ffffff?text=Festival",
      featured: false,
    },
    {
      id: "4",
      title: "스트리밍 시대의 음악 소비 패턴 변화",
      excerpt:
        "디지털 스트리밍 플랫폼의 등장으로 변화한 음악 소비 패턴을 데이터로 분석해보았습니다. MZ세대의 음악 취향과 소비 행태...",
      author: "데이터 분석팀",
      date: "2025.08.05",
      category: "분석",
      views: 6780,
      likes: 321,
      comments: 67,
      thumbnail: "https://placehold.co/400x250/10b981/ffffff?text=Streaming",
      featured: false,
    },
  ];

  const categories = [
    { name: "전체", count: 156, active: true },
    { name: "트렌드", count: 45 },
    { name: "아티스트", count: 38 },
    { name: "페스티벌", count: 23 },
    { name: "분석", count: 28 },
    { name: "리뷰", count: 22 },
  ];

  const featuredPost = posts.find((post) => post.featured);
  const regularPosts = posts.filter((post) => !post.featured);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-Snowlight-pink to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">뮤직포스트</h1>
        <p className="text-lg opacity-90">
          음악에 대한 다양한 이야기와 소식을 만나보세요
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.name}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category.active
                ? "bg-Snowlight-pink text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">주요 포스트</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={featuredPost.thumbnail}
                  alt={featuredPost.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="bg-Snowlight-pink text-white text-xs px-2 py-1 rounded">
                    {featuredPost.category}
                  </span>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                    FEATURED
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-Snowlight-pink transition-colors">
                  <Link to={`/post/${featuredPost.id}`}>
                    {featuredPost.title}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{featuredPost.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{featuredPost.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{featuredPost.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{featuredPost.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Regular Posts */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6">최신 포스트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <Link to={`/post/${post.id}`}>
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {post.category}
                  </span>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{post.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{post.likes}</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-Snowlight-pink transition-colors">
                  <Link to={`/post/${post.id}`}>{post.title}</Link>
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="w-3 h-3" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>{post.date}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <MessageCircle className="w-3 h-3" />
                    <span>{post.comments} 댓글</span>
                  </div>
                  <button className="text-gray-400 hover:text-Snowlight-pink transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Load More */}
      <div className="text-center">
        <button className="Snowlight-button Snowlight-button-secondary">
          더 많은 포스트 보기
        </button>
      </div>
    </div>
  );
}
