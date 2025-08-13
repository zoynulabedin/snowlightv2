import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { Play, Heart, Download, MoreHorizontal, Share2, MessageCircle, Star } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "서우젯소리 - 벅스" },
    { name: "description", content: "사우스 카니발(South Carnival)의 앨범 서우젯소리" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  // Mock album data - in real app, this would fetch from database
  const album = {
    id: params.id,
    title: "서우젯소리",
    artist: "사우스 카니발(South Carnival)",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.08",
    type: "싱글",
    genre: ["인디", "락/메탈"],
    style: ["인디 락"],
    duration: "10:05",
    distributor: "NHN벅스",
    label: "(주)루비레코드",
    quality: "FLAC 16bit, 24bit",
    description: `서우젯 소리는 원래 굿을 할 때 '석살림' 제사에서 신을 흥겹게 놀리기 위해 부르던 노래이다. 특히 '두린굿'에서는 환자의 몸에 빙의한 영감(도깨비)신을 내쫓을 때 환자를 춤추게 하면서 부르던 노래였다. 이처럼 서우젯 소리는 굿판에서 신을 놀리는 놀이무가였으나 민간에 전승되면서 민요화되었다.`,
    tracks: [
      {
        id: "1",
        number: 1,
        title: "서우젯소리",
        artist: "사우스 카니발(South Carnival)",
        duration: "5:32",
        isTitle: true
      },
      {
        id: "2",
        number: 2,
        title: "멀구야",
        artist: "사우스 카니발(South Carnival)",
        duration: "4:33",
        isTitle: false
      }
    ]
  };

  return { album };
}

export default function AlbumDetail() {
  const { album } = useLoaderData<typeof loader>();
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTracks([]);
    } else {
      setSelectedTracks(album.tracks.map(track => track.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectTrack = (trackId: string) => {
    if (selectedTracks.includes(trackId)) {
      setSelectedTracks(selectedTracks.filter(id => id !== trackId));
    } else {
      setSelectedTracks([...selectedTracks, trackId]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Album Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Album Cover */}
        <div className="lg:col-span-1">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 group">
            <img
              src={`https://via.placeholder.com/400x400/ff1493/ffffff?text=${encodeURIComponent(album.title)}`}
              alt={album.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                <Play className="w-6 h-6 text-bugs-pink ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Album Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{album.title}</h1>
            <Link
              to={`/artist/${album.artist}`}
              className="text-xl text-bugs-pink hover:text-pink-600 font-medium"
            >
              {album.artist}
            </Link>
          </div>

          {/* Album Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex">
                <span className="w-20 text-gray-600">유형</span>
                <span>{album.type}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">장르</span>
                <div className="flex space-x-2">
                  {album.genre.map((g) => (
                    <Link key={g} to={`/genre/${g}`} className="text-bugs-pink hover:underline">
                      {g}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">스타일</span>
                <div className="flex space-x-2">
                  {album.style.map((s) => (
                    <Link key={s} to={`/style/${s}`} className="text-bugs-pink hover:underline">
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">발매일</span>
                <span>{album.releaseDate}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex">
                <span className="w-20 text-gray-600">유통사</span>
                <span>{album.distributor}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">기획사</span>
                <span>{album.label}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">재생 시간</span>
                <span>{album.duration}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">고음질</span>
                <span className="text-bugs-pink">{album.quality}</span>
              </div>
            </div>
          </div>

          {/* Album Actions */}
          <div className="flex items-center space-x-4">
            <button className="bugs-button bugs-button-primary">
              앨범구매
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-bugs-pink">
              <Heart className="w-5 h-5" />
              <span>좋아 0</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-bugs-pink">
              <MessageCircle className="w-5 h-5" />
              <span>0개</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-bugs-pink">
              <Share2 className="w-5 h-5" />
              <span>공유</span>
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">수록곡 ({album.tracks.length})</h2>
        
        {/* Bulk Actions */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-bugs-pink focus:ring-bugs-pink"
            />
            <span className="text-sm">곡 목록 전체</span>
          </label>
          <div className="flex space-x-2">
            <button className="bugs-button bugs-button-secondary text-sm">
              선택된 곡 재생듣기
            </button>
            <button className="bugs-button bugs-button-secondary text-sm">
              재생목록에 추가
            </button>
            <button className="bugs-button bugs-button-secondary text-sm">
              내 앨범에 담기
            </button>
            <button className="bugs-button bugs-button-secondary text-sm">
              다운로드
            </button>
          </div>
          <div className="flex space-x-2 ml-auto">
            <button className="bugs-button bugs-button-primary text-sm">
              전체 듣기(재생목록 추가)
            </button>
            <button className="bugs-button bugs-button-secondary text-sm">
              전체 듣기(재생목록 교체)
            </button>
          </div>
        </div>

        {/* Track Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
            <div className="col-span-1">번호</div>
            <div className="col-span-6">곡</div>
            <div className="col-span-2">아티스트</div>
            <div className="col-span-3">듣기 재생목록 내앨범 다운 영상 기타</div>
          </div>
          
          {album.tracks.map((track) => (
            <div
              key={track.id}
              className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {/* Track Number */}
              <div className="col-span-1 flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTracks.includes(track.id)}
                    onChange={() => handleSelectTrack(track.id)}
                    className="rounded border-gray-300 text-bugs-pink focus:ring-bugs-pink"
                  />
                </label>
                <div className="text-center">
                  <div className="text-lg font-bold">{track.number}</div>
                  {track.isTitle && (
                    <span className="text-xs text-bugs-pink font-bold">[타이틀곡]</span>
                  )}
                </div>
              </div>

              {/* Track Info */}
              <div className="col-span-6 flex items-center">
                <div>
                  <h3 className="font-medium text-gray-900 hover:text-bugs-pink cursor-pointer">
                    {track.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {track.duration}
                  </p>
                </div>
              </div>

              {/* Artist */}
              <div className="col-span-2 flex items-center">
                <Link
                  to={`/artist/${track.artist}`}
                  className="text-gray-900 hover:text-bugs-pink"
                >
                  {track.artist}
                </Link>
              </div>

              {/* Actions */}
              <div className="col-span-3 flex items-center space-x-2">
                <button className="bugs-button-secondary text-xs px-2 py-1">곡정보</button>
                <button className="p-1 hover:bg-gray-200 rounded" title="듣기">
                  <Play className="w-4 h-4 text-bugs-pink" />
                </button>
                <button className="text-xs text-gray-600 hover:text-bugs-pink">재생목록에 추가</button>
                <button className="text-xs text-gray-600 hover:text-bugs-pink">내 앨범에 담기</button>
                <button className="text-xs text-bugs-pink hover:text-pink-600">flac 다운로드</button>
                <button className="text-xs text-gray-600 hover:text-bugs-pink">기타 기능</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Album Description */}
      {album.description && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">앨범 소개</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {album.description}
            </p>
          </div>
        </section>
      )}

      {/* Comments Section */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">한마디 (0)</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <textarea
              placeholder="한마디 입력"
              className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-bugs-pink focus:border-transparent"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <button className="bugs-button bugs-button-secondary text-sm">
                음악 첨부
              </button>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">0/300</span>
                <button className="bugs-button bugs-button-primary text-sm">
                  등록
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center text-gray-500">
            등록된 한마디가 없습니다. 첫 번째 한마디를 남겨보세요!
          </div>
        </div>
      </section>
    </div>
  );
}

