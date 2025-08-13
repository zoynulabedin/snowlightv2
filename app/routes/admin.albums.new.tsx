import {
  json,
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useActionData } from "@remix-run/react";
import { useState } from "react";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await validateSession(request);

  if (!user || user.role !== "SUPER_ADMIN") {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Get artists for selection
  const artists = await db.artist.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, stageName: true },
  });

  return json({ artists });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await validateSession(request);

  if (!user || user.role !== "SUPER_ADMIN") {
    throw new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const coverImage = formData.get("coverImage") as string;
  const releaseDate = formData.get("releaseDate") as string;
  const genre = formData.get("genre") as string;
  const type = formData.get("type") as string;
  const artistIds = formData.getAll("artistIds") as string[];
  const isPublished = formData.get("isPublished") === "on";
  const isApproved = formData.get("isApproved") === "on";
  const isFeatured = formData.get("isFeatured") === "on";

  try {
    // Create the album
    const album = await db.album.create({
      data: {
        title,
        description: description || null,
        coverImage: coverImage || null,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        genre: genre || null,
        type: (type as any) || "ALBUM",
        isPublished,
        isApproved,
        isFeatured,
      },
    });

    // Add artist relationships
    if (artistIds.length > 0) {
      await Promise.all(
        artistIds.map((artistId) =>
          db.albumArtist.create({
            data: {
              albumId: album.id,
              artistId,
              role: "Artist",
            },
          })
        )
      );
    }

    return redirect("/admin?tab=albums&success=created");
  } catch (error) {
    return json({ error: "앨범 생성에 실패했습니다." }, { status: 400 });
  }
}

export default function NewAlbum() {
  const { artists } = useLoaderData<typeof loader>();
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
          <h1 className="text-3xl font-bold text-gray-900">새 앨범 생성</h1>
          <p className="text-gray-600">새로운 앨범을 플랫폼에 추가합니다</p>
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
                앨범 제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="앨범 제목을 입력하세요"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                앨범 타입 *
              </label>
              <select
                id="type"
                name="type"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="SINGLE">싱글</option>
                <option value="EP">EP</option>
                <option value="ALBUM">정규앨범</option>
                <option value="COMPILATION">컴필레이션</option>
                <option value="SOUNDTRACK">사운드트랙</option>
              </select>
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
          </div>

          {/* Cover Image */}
          <div>
            <label
              htmlFor="coverImage"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              커버 이미지
            </label>
            <div className="mt-1 flex items-center gap-4">
              <input
                type="file"
                id="coverImageFile"
                name="coverImageFile"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                accept="image/*"
              />
              <p className="text-sm text-gray-500">또는</p>
              <input
                type="url"
                id="coverImage"
                name="coverImage"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="https://example.com/cover.jpg"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              이미지 파일을 업로드하거나 이미지 URL을 입력하세요.
            </p>
          </div>

          {/* Artists Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              아티스트 선택 *
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
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
            {selectedArtists.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                최소 한 명의 아티스트를 선택해야 합니다.
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              앨범 설명
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="앨범에 대한 설명을 입력하세요"
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
                <span className="text-sm text-gray-700">추천 앨범</span>
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
              disabled={selectedArtists.length === 0}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              앨범 생성
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
