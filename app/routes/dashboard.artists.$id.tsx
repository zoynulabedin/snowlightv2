import {
  json,
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import { ArrowLeft, User, AlertCircle, Save } from "lucide-react";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("auth-token="))
    ?.split("=")[1];

  if (!token) {
    return redirect("/login");
  }

  const user = await validateSession(token);
  if (!user) {
    return redirect("/login");
  }

  const artistId = params.id;
  let artist = null;

  if (artistId && artistId !== "new") {
    artist = await db.artist.findUnique({
      where: { id: artistId, userId: user.id },
      include: {
        songArtists: {
          include: { song: { select: { id: true, title: true } } },
        },
        albumArtists: {
          include: { album: { select: { id: true, title: true } } },
        },
      },
    });

    if (!artist) {
      throw new Response("Not Found", { status: 404 });
    }
  }

  return json({ artist, user });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("auth-token="))
    ?.split("=")[1];

  if (!token) {
    return redirect("/login");
  }

  const user = await validateSession(token);
  if (!user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const artistId = params.id;

  const name = formData.get("name") as string;
  const stageName = formData.get("stageName") as string;
  const bio = formData.get("bio") as string;
  const avatar = formData.get("avatar") as string;
  const coverImage = formData.get("coverImage") as string;
  const genre = formData.get("genre") as string;
  const country = formData.get("country") as string;
  const debutYear = formData.get("debutYear") as string;
  const isVerified = formData.get("isVerified") === "on";

  const errors: Record<string, string> = {};

  if (!name) errors.name = "이름을 입력하세요";

  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

  try {
    if (artistId && artistId !== "new") {
      // Edit existing artist
      const existingArtist = await db.artist.findUnique({
        where: { id: artistId, userId: user.id },
      });

      if (!existingArtist) {
        return json({ errors: { general: "권한이 없습니다." } });
      }

      await db.artist.update({
        where: { id: artistId },
        data: {
          name,
          stageName: stageName || null,
          bio: bio || null,
          avatar: avatar || null,
          coverImage: coverImage || null,
          genre: genre || null,
          country: country || null,
          debutYear: debutYear ? parseInt(debutYear) : null,
          isVerified,
        },
      });
    } else {
      // Create new artist
      await db.artist.create({
        data: {
          name,
          stageName: stageName || null,
          bio: bio || null,
          avatar: avatar || null,
          coverImage: coverImage || null,
          genre: genre || null,
          country: country || null,
          debutYear: debutYear ? parseInt(debutYear) : null,
          isVerified,
          userId: user.id,
        },
      });
    }

    return redirect("/dashboard/artists");
  } catch (error) {
    console.error("Error saving artist:", error);
    return json({
      errors: { general: "아티스트 저장 중 오류가 발생했습니다." },
    });
  }
}

export default function ArtistForm() {
  const { artist } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ errors?: Record<string, string> }>();
  const navigation = useNavigation();
  const isEditing = !!artist;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link
              to="/dashboard/artists"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />← 아티스트 관리
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditing ? "아티스트 편집" : "새 아티스트 등록"}
            </h1>
          </div>

          <Form method="post" className="p-6 space-y-6">
            {actionData?.errors?.general && (
              <div className="bg-red-50 border border-red-300 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {actionData.errors.general}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  본명 *
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  defaultValue={artist?.name || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="아티스트의 본명을 입력하세요"
                />
                {actionData?.errors?.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {actionData.errors.name}
                  </p>
                )}
              </div>

              {/* Stage Name */}
              <div>
                <label
                  htmlFor="stageName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  예명/활동명
                </label>
                <input
                  id="stageName"
                  type="text"
                  name="stageName"
                  defaultValue={artist?.stageName || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="활동할 때 사용하는 이름"
                />
              </div>

              {/* Genre */}
              <div>
                <label
                  htmlFor="genre"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  주요 장르
                </label>
                <select
                  id="genre"
                  name="genre"
                  defaultValue={artist?.genre || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">장르를 선택하세요</option>
                  <option value="KPOP">K-POP</option>
                  <option value="POP">POP</option>
                  <option value="ROCK">ROCK</option>
                  <option value="HIPHOP">HIP-HOP</option>
                  <option value="RNB">R&B</option>
                  <option value="JAZZ">JAZZ</option>
                  <option value="CLASSICAL">CLASSICAL</option>
                  <option value="ELECTRONIC">ELECTRONIC</option>
                  <option value="INDIE">INDIE</option>
                  <option value="FOLK">FOLK</option>
                </select>
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  국가
                </label>
                <input
                  id="country"
                  type="text"
                  name="country"
                  defaultValue={artist?.country || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="한국, 미국, 일본 등"
                />
              </div>

              {/* Debut Year */}
              <div>
                <label
                  htmlFor="debutYear"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  데뷔 연도
                </label>
                <input
                  id="debutYear"
                  type="number"
                  name="debutYear"
                  min="1900"
                  max={new Date().getFullYear()}
                  defaultValue={artist?.debutYear || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="2023"
                />
              </div>
            </div>

            {/* Avatar */}
            <div>
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                프로필 이미지 URL
              </label>
              <input
                id="avatar"
                type="url"
                name="avatar"
                defaultValue={artist?.avatar || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://example.com/profile.jpg"
              />
            </div>

            {/* Cover Image */}
            <div>
              <label
                htmlFor="coverImage"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                커버 이미지 URL
              </label>
              <input
                id="coverImage"
                type="url"
                name="coverImage"
                defaultValue={artist?.coverImage || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                소개
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={artist?.bio || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="아티스트에 대한 소개를 입력하세요..."
              />
            </div>

            {/* Options */}
            <div className="flex items-center">
              <input
                id="isVerified"
                type="checkbox"
                name="isVerified"
                defaultChecked={artist?.isVerified || false}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isVerified"
                className="ml-2 block text-sm text-gray-900"
              >
                인증 아티스트로 설정
              </label>
            </div>

            {/* Related Content */}
            {artist && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Songs */}
                {artist.songArtists.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      연결된 음악
                    </h3>
                    <div className="bg-gray-50 rounded-md p-4 max-h-32 overflow-y-auto">
                      <ul className="space-y-1">
                        {artist.songArtists.map((songArtist) => (
                          <li
                            key={songArtist.songId}
                            className="text-sm text-gray-600"
                          >
                            • {songArtist.song.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Albums */}
                {artist.albumArtists.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      연결된 앨범
                    </h3>
                    <div className="bg-gray-50 rounded-md p-4 max-h-32 overflow-y-auto">
                      <ul className="space-y-1">
                        {artist.albumArtists.map((albumArtist) => (
                          <li
                            key={albumArtist.albumId}
                            className="text-sm text-gray-600"
                          >
                            • {albumArtist.album.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Link
                to="/dashboard/artists"
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={navigation.state === "submitting"}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {navigation.state === "submitting" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? "수정 완료" : "아티스트 등록"}
                  </>
                )}
              </button>
            </div>
          </Form>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <div className="flex">
            <User className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                아티스트 등록 안내
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>아티스트를 등록하면 음악과 앨범에 연결할 수 있습니다.</li>
                  <li>예명이 있다면 예명을 우선적으로 표시됩니다.</li>
                  <li>
                    프로필 이미지와 커버 이미지를 모두 등록하는 것을 권장합니다.
                  </li>
                  <li>인증 아티스트는 특별한 표시가 나타납니다.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
