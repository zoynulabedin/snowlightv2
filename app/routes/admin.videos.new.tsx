import { json, ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData, useActionData } from "@remix-run/react";
import { useState } from "react";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await validateSession(request);
  
  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Get artists and songs for selection
  const [artists, songs] = await Promise.all([
    db.artist.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, stageName: true }
    }),
    db.song.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true },
      include: {
        artists: {
          include: { artist: true }
        }
      }
    })
  ]);

  return json({ artists, songs });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await validateSession(request);
  
  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const thumbnailUrl = formData.get("thumbnailUrl") as string;
  const duration = formData.get("duration") as string;
  const genre = formData.get("genre") as string;
  const language = formData.get("language") as string;
  const ageRating = formData.get("ageRating") as string;
  const songId = formData.get("songId") as string;
  const artistIds = formData.getAll("artistIds") as string[];
  const isPublished = formData.get("isPublished") === "on";
  const isApproved = formData.get("isApproved") === "on";
  const isFeatured = formData.get("isFeatured") === "on";

  try {
    // Create the video
    const video = await db.video.create({
      data: {
        title,
        description: description || null,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        duration: duration ? parseInt(duration) : null,
        genre: genre || null,
        language: language || null,
        ageRating: ageRating || null,
        songId: songId || null,
        isPublished,
        isApproved,
        isFeatured
      }
    });

    // Add artist relationships
    if (artistIds.length > 0) {
      await Promise.all(
        artistIds.map(artistId =>
          db.videoArtist.create({
            data: {
              videoId: video.id,
              artistId,
              role: "Artist"
            }
          })
        )
      );
    }

    return redirect("/admin?tab=videos&success=created");
  } catch (error) {
    return json({ error: "비디오 생성에 실패했습니다." }, { status: 400 });
  }
}

export default function NewVideo() {
  const { artists, songs } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);

  const handleArtistToggle = (artistId: string) => {
    setSelectedArtists(prev =>
      prev.includes(artistId)
        ? prev.filter(id => id !== artistId)
        : [...prev, artistId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">새 비디오 추가</h1>
          <p className="text-gray-600">새로운 뮤직비디오를 플랫폼에 추가합니다</p>
        </div>

        {actionData?.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{actionData.error}</p>
          </div>
        )}

        <Form method="post" className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                비디오 제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="비디오 제목을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                재생 시간 (초)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="180"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                장르
              </label>
              <select
                id="genre"
                name="genre"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="">장르 선택</option>
                <option value="K-POP">K-POP</option>
                <option value="발라드">발라드</option>
                <option value="힙합">힙합</option>
                <option value="R&B">R&B</option>
                <option value="록">록</option>
                <option value="인디">인디</option>
                <option value="재즈">재즈</option>
                <option value="클래식">클래식</option>
                <option value="트로트">트로트</option>
                <option value="EDM">EDM</option>
              </select>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                언어
              </label>
              <select
                id="language"
                name="language"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="">언어 선택</option>
                <option value="Korean">한국어</option>
                <option value="English">영어</option>
                <option value="Japanese">일본어</option>
                <option value="Chinese">중국어</option>
                <option value="Other">기타</option>
              </select>
            </div>

            <div>
              <label htmlFor="ageRating" className="block text-sm font-medium text-gray-700 mb-2">
                연령 등급
              </label>
              <select
                id="ageRating"
                name="ageRating"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="">등급 선택</option>
                <option value="전체 관람가">전체 관람가</option>
                <option value="12세 이상 관람가">12세 이상 관람가</option>
                <option value="15세 이상 관람가">15세 이상 관람가</option>
                <option value="19세 이상 관람가">19세 이상 관람가</option>
              </select>
            </div>
          </div>

          {/* Media URLs */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">미디어 파일</h3>
            
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                비디오 URL *
              </label>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="https://example.com/video.mp4"
              />
            </div>

            <div>
              <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-2">
                썸네일 이미지 URL
              </label>
              <input
                type="url"
                id="thumbnailUrl"
                name="thumbnailUrl"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
          </div>

          {/* Song Connection */}
          <div>
            <label htmlFor="songId" className="block text-sm font-medium text-gray-700 mb-2">
              연결된 곡 (선택사항)
            </label>
            <select
              id="songId"
              name="songId"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">곡 선택 (선택사항)</option>
              {songs.map((song) => (
                <option key={song.id} value={song.id}>
                  {song.title} - {song.artists.map(sa => sa.artist.name).join(', ')}
                </option>
              ))}
            </select>
          </div>

          {/* Artists Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              아티스트 선택
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {artists.map((artist) => (
                <label key={artist.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    name="artistIds"
                    value={artist.id}
                    checked={selectedArtists.includes(artist.id)}
                    onChange={() => handleArtistToggle(artist.id)}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">
                    {artist.stageName || artist.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              비디오 설명
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="비디오에 대한 설명을 입력하세요"
            />
          </div>

          {/* Status Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">상태 설정</h3>
            
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isPublished"
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">공개</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isApproved"
                  defaultChecked
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">승인됨</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">추천 비디오</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              비디오 추가
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

