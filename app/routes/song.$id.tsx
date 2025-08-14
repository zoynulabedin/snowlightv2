import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import {
  Play,
  Heart,
  MessageCircle,
  Facebook,
  Link as LinkIcon,
  Download,
  Plus,
  MoreHorizontal,
  Volume2,
} from "lucide-react";

import { usePlayer } from "~/contexts/PlayerContext";
import { db } from "~/lib/db";
import Layout from "~/components/Layout";
import AudioPlayer from "~/components/AudioPlayer";
import VideoPlayer from "~/components/VideoPlayer";
import { getSidebarAlbums } from "../lib/server";

export async function loader({ params }: LoaderFunctionArgs) {
  const songId = params.id;

  if (!songId) {
    throw new Response("Song not found", { status: 404 });
  }
  const sidebarAlbums = await getSidebarAlbums(15);
  try {
    // Try to get song from database first
    const song = await db.song.findUnique({
      where: { id: songId },
      include: {
        artists: {
          include: { artist: true },
        },
        album: {
          include: {
            artists: {
              include: { artist: true },
            },
          },
        },
      },
    });

    const placeholderImg = "https://placehold.co/600x400";
    // If no song found in database, create mock data based on songId
    if (!song) {
      // Remove sample/mock data, return not found
      throw new Response("Song not found", { status: 404 });
    } else {
      if (!song.coverImage) song.coverImage = placeholderImg;
      if (!song.duration) song.duration = 0;
      if (!song.audioUrl) song.audioUrl = "";
    }

    // Get related videos (mock data for now)
    const videos = [
      {
        id: "v1",
        title: `${song.title} (Music Video)`,
        artists: song.artists,
        duration: 180,
        thumbnailUrl: song.coverImage || placeholderImg,
        videoUrl:
          "https://res.cloudinary.com/dsp05t7kx/video/upload/v1755014244/Snowlight-music/video/1755014242719_s30.mp4",
        createdAt: new Date().toISOString(),
      },
      {
        id: "v2",
        title: `${song.title} (Performance Video)`,
        artists: song.artists,
        duration: 200,
        thumbnailUrl: song.coverImage || placeholderImg,
        videoUrl:
          "https://res.cloudinary.com/dsp05t7kx/video/upload/v1755014244/Snowlight-music/video/1755014242719_s30.mp4",
        createdAt: new Date().toISOString(),
      },
    ];

    return json({ song, videos, sidebarAlbums });
  } catch (error) {
    console.error("Error loading song:", error);
    throw new Response("Internal Server Error", { status: 500 });
  }
}

export default function SongDetails() {
  const { song, videos, sidebarAlbums } = useLoaderData<typeof loader>();
  const { playTrack } = usePlayer();
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<(typeof videos)[0] | null>(
    null
  );

  const placeholderImg = "https://placehold.co/600x400";

  if (!song) return <div>노래 정보를 찾을 수 없습니다.</div>;

  const handlePlay = () => {
    playTrack({
      id: song.id,
      title: song.title,
      artist: song.artists.map((a) => a.artist.name).join(", "),
      audioUrl: song.audioUrl || "",
      coverImage: song.coverImage || placeholderImg,
      duration: song.duration || 0,
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, ".")
      .replace(".", "");
  };

  return (
    <Layout sidebarAlbums={sidebarAlbums}>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Album Cover */}
              <div className="flex-shrink-0">
                <img
                  src={song.coverImage || placeholderImg}
                  alt={song.title}
                  className="w-64 h-64 object-cover rounded-lg shadow-lg"
                />
              </div>

              {/* Song Information */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-4">{song.title}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="mb-2">
                      <span className="text-gray-200">아티스트:</span>
                      <span className="ml-2 font-medium">
                        {song.artists.map((artist, index) => (
                          <span key={artist.artistId || index}>
                            <Link
                              to={`/artist/${artist.artist.name}`}
                              className="hover:underline"
                            >
                              {artist.artist.name}
                            </Link>
                            {index < song.artists.length - 1 && ", "}
                          </span>
                        ))}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-200">유형:</span>
                      <span className="ml-2">
                        {song.album ? "앨범" : "싱글"}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-200">장르:</span>
                      <span className="ml-2 bg-pink-600 px-2 py-1 rounded text-xs">
                        {song.genre}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-200">스타일:</span>
                      <span className="ml-2 bg-purple-600 px-2 py-1 rounded text-xs">
                        {song.genre}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2">
                      <span className="text-gray-200">발매일:</span>
                      <span className="ml-2">{formatDate(song.createdAt)}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-200">유통사:</span>
                      <span className="ml-2">Snowlight Music</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-200">기획사:</span>
                      <span className="ml-2">Snowlight Entertainment</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-200">재생 시간:</span>
                      <span className="ml-2">
                        {formatDuration(song.duration || 0)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-200">고음질:</span>
                      <span className="ml-2 bg-blue-600 px-2 py-1 rounded text-xs">
                        FLAC 16bit
                      </span>
                      <span className="ml-1 bg-yellow-600 px-2 py-1 rounded text-xs">
                        하이 레졸루션
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-3">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg transition-colors ${
                      liked ? "bg-pink-600" : "bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${liked ? "fill-current" : ""}`}
                    />
                    <span>좋아 {song.likes + (liked ? 1 : 0)}</span>
                  </button>

                  <button className="flex items-center space-x-2 w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>0개</span>
                  </button>

                  <button className="flex items-center space-x-2 w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>쓰기</span>
                  </button>

                  <div className="border-t border-white/20 pt-3">
                    <p className="text-xs text-gray-200 mb-2">공유</p>
                    <div className="flex space-x-2">
                      <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">
                        <Facebook className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors">
                        <LinkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Song List */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">수록곡 (1)</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-pink-100 text-pink-600 rounded text-sm">
                    전체
                  </button>
                  <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                    재생목록에 추가
                  </button>
                  <button className="px-3 py-1 bg-green-100 text-green-600 rounded text-sm">
                    내 앨범에 담기
                  </button>
                  <button className="px-3 py-1 bg-purple-100 text-purple-600 rounded text-sm">
                    다운로드
                  </button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-600">번호</span>
                      <span className="text-sm text-gray-600">곡</span>
                      <span className="text-sm text-gray-600">아티스트</span>
                    </div>
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>듣기</span>
                      <span>재생목록</span>
                      <span>내앨범</span>
                      <span>다운</span>
                      <span>영상</span>
                      <span>기타</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <input type="checkbox" className="rounded" />
                      <span className="w-8 text-center font-bold text-pink-600">
                        1
                      </span>
                      <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded text-xs">
                        [타이틀곡]
                      </span>
                      <div>
                        <div className="font-medium">{song.title}</div>
                        <div className="text-sm text-gray-600">
                          {song.artists.map((a) => a.artist.name).join(", ")}
                        </div>
                        {/* AudioPlayer for song preview */}
                        <AudioPlayer
                          src={
                            song.audioUrl && song.audioUrl !== ""
                              ? song.audioUrl
                              : ""
                          }
                          coverImage={song.coverImage || placeholderImg}
                          title={song.title}
                          artist={song.artists
                            .map((a) => a.artist.name)
                            .join(", ")}
                          album={song.album?.title || ""}
                          duration={song.duration || 0}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handlePlay}
                        className="flex items-center space-x-1 px-3 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span>듣기</span>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Album Description */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">앨범 소개</h3>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  {song.description ||
                    `${song.artists
                      .map((a) => a.artist.name)
                      .join(", ")}가 새로운 싱글앨범 &quot;${
                      song.title
                    }&quot;로 돌아왔다.`}
                </p>
                <p className="mb-4">
                  &quot;{song.title}&quot;는 사랑하는 사람의 아픔을 지켜보며
                  느끼는 복잡한 감정을 섬세하게 그려낸 곡이다.
                </p>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">[Credit]</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>1. {song.title}</div>
                    <div>Composed by Snowlight Music</div>
                    <div>Lyrics by Snowlight Music</div>
                    <div>Recorded by Snowlight Studio</div>
                    <div>Mixed by Snowlight Studio</div>
                    <div>Mastered by Snowlight Mastering</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Videos Section */}
          {videos.length > 0 &&
            videos.some(
              (video) => video.artists && video.artists.length > 0
            ) && (
              <div className="bg-white rounded-lg shadow-sm mb-8">
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4">영상</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {videos
                      .filter(
                        (video) => video.artists && video.artists.length > 0
                      )
                      .map((video) => (
                        <div key={video.id} className="group cursor-pointer">
                          <div className="relative">
                            <button
                              type="button"
                              className="w-full h-32 object-cover rounded-lg p-0 border-none bg-transparent focus:outline-none"
                              aria-label={`영상 재생: ${video.title}`}
                            >
                              <img
                                src={video.thumbnailUrl || placeholderImg}
                                alt={video.title}
                                className="w-full h-32 object-cover rounded-lg pointer-events-none"
                                tabIndex={-1}
                                aria-hidden="true"
                              />
                            </button>
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedVideo(video)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  setSelectedVideo(video);
                                }
                              }}
                              className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center"
                            >
                              <Play className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {formatDuration(video.duration)}
                            </div>
                          </div>
                          <div className="mt-2">
                            <h4 className="font-medium text-sm line-clamp-2">
                              {video.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {video.artists
                                .map((a) => a.artist.name)
                                .join(", ")}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(video.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                  {/* VideoPlayer Modal */}
                  {selectedVideo && (
                    <VideoPlayer
                      videoUrl={selectedVideo.videoUrl || ""}
                      title={selectedVideo.title || ""}
                      isVisible={!!selectedVideo}
                      onClose={() => setSelectedVideo(null)}
                      autoPlay={true}
                    />
                  )}
                </div>
              </div>
            )}

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">한마디 (0)</h3>

              <div className="mb-6">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="한마디를 남겨주세요..."
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  maxLength={300}
                />
                <div className="flex items-center justify-between mt-2">
                  <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800">
                    <Volume2 className="w-4 h-4" />
                    <span>음악 첨부</span>
                  </button>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {comment.length}/300
                    </span>
                    <button className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors">
                      등록
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mb-4">
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  등록순
                </button>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm">
                  호감순
                </button>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm">
                  답글순
                </button>
              </div>

              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>등록된 한마디가 없습니다. 첫 번째 한마디를 남겨주세요!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
