import {
  json,
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData, useActionData } from "@remix-run/react";
import { useState } from "react";
import { ArrowLeft, Upload, Music, AlertCircle } from "lucide-react";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("auth_token="))
    ?.split("=")[1];

  if (!token) {
    return redirect("/login");
  }

  const user = await validateSession(token);
  if (!user || !user.isAdmin) {
    return redirect("/dashboard");
  }

  const [albums, artists] = await Promise.all([
    db.album.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    db.artist.findMany({
      orderBy: { stageName: "asc" },
      select: { id: true, name: true, stageName: true },
    }),
  ]);

  return json({ albums, artists });
}

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("auth_token="))
    ?.split("=")[1];

  if (!token) {
    return redirect("/login");
  }

  const user = await validateSession(token);
  if (!user || !user.isAdmin) {
    return redirect("/dashboard");
  }

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const duration = formData.get("duration") as string;
  const audioUrl = formData.get("audioUrl") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const lyrics = formData.get("lyrics") as string;
  const genre = formData.get("genre") as string;
  const releaseDate = formData.get("releaseDate") as string;
  const description = formData.get("description") as string;
  const language = formData.get("language") as string;
  const coverImage = formData.get("coverImage") as string;
  const albumId = formData.get("albumId") as string;
  const artistIds = formData.getAll("artistIds") as string[];
  const isPublished = formData.get("isPublished") === "on";
  const isApproved = formData.get("isApproved") === "on";
  const isFeatured = formData.get("isFeatured") === "on";

  try {
    // Create the song
    const song = await db.song.create({
      data: {
        title,
        duration: duration ? parseInt(duration) : null,
        audioUrl: audioUrl || null,
        videoUrl: videoUrl || null,
        lyrics: lyrics || null,
        genre: genre || null,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        description: description || null,
        language: language || null,
        coverImage: coverImage || null,
        albumId: albumId || null,
        uploadedById: user.id,
        isPublished,
        isApproved,
        isFeatured,
      },
    });

    // Add artist relationships
    if (artistIds.length > 0) {
      await Promise.all(
        artistIds.map((artistId) =>
          db.songArtist.create({
            data: {
              songId: song.id,
              artistId,
              role: "Artist",
            },
          })
        )
      );
    }

    return redirect("/admin/songs");
  } catch (error) {
    return json({ error: "곡 생성에 실패했습니다." }, { status: 400 });
  }
}

export default function NewSong() {
  const { artists, albums } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);

  const handleArtistToggle = (artistId: string) => {
    setSelectedArtists((prev) =>
      prev.includes(artistId)
        ? prev.filter((id) => id !== artistId)
        : [...prev, artistId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">새 곡 추가</h1>
          <p className="text-gray-600">새로운 음악을 플랫폼에 추가합니다</p>
        </div>

        {actionData?.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{actionData.error}</p>
          </div>
        )}

        <Form
          method="post"
          className="bg-white rounded-lg shadow p-6 space-y-6"
        >
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                곡 제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="곡 제목을 입력하세요"
              />
            </div>

            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="genre"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
              <label
                htmlFor="language"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="releaseDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                발매일
              </label>
              <input
                type="date"
                id="releaseDate"
                name="releaseDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label
                htmlFor="albumId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                앨범
              </label>
              <select
                id="albumId"
                name="albumId"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="">앨범 선택 (선택사항)</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Media URLs */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">미디어 파일</h3>

            <div>
              <label
                htmlFor="audioUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                오디오 URL
              </label>
              <input
                type="url"
                id="audioUrl"
                name="audioUrl"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="https://example.com/audio.mp3"
              />
            </div>

            <div>
              <label
                htmlFor="videoUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비디오 URL
              </label>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="https://example.com/video.mp4"
              />
            </div>

            <div>
              <label
                htmlFor="coverImage"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                커버 이미지 URL
              </label>
              <input
                type="url"
                id="coverImage"
                name="coverImage"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="https://example.com/cover.jpg"
              />
            </div>
          </div>

          {/* Artists Selection */}
          <div>
            <label
              htmlFor="artists-section"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              아티스트 선택
            </label>
            <div
              id="artists-section"
              className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3"
            >
              {artists.map((artist) => (
                <label
                  key={artist.id}
                  className="flex items-center space-x-2 py-1"
                >
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

          {/* Description and Lyrics */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              곡 설명
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="곡에 대한 설명을 입력하세요"
            />
          </div>

          <div>
            <label
              htmlFor="lyrics"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              가사
            </label>
            <textarea
              id="lyrics"
              name="lyrics"
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="가사를 입력하세요"
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
                <span className="text-sm text-gray-700">추천 곡</span>
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
              곡 추가
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
