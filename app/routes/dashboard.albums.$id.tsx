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
import { ArrowLeft, Album, AlertCircle, Save } from "lucide-react";
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

  const albumId = params.id;
  let album = null;

  if (albumId && albumId !== "new") {
    // For existing albums, find albums that contain user's songs
    album = await db.album.findFirst({
      where: {
        id: albumId,
        songs: { some: { uploadedById: user.id } },
      },
      include: {
        songs: {
          where: { uploadedById: user.id },
          select: { id: true, title: true },
        },
        artists: {
          include: { artist: true },
        },
      },
    });

    if (!album) {
      throw new Response("Not Found", { status: 404 });
    }
  }

  const artists = await db.artist.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, stageName: true },
  });

  return json({ album, artists, user });
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
  const albumId = params.id;

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const coverImage = formData.get("coverImage") as string;
  const releaseDate = formData.get("releaseDate") as string;
  const genre = formData.get("genre") as string;
  const artistId = formData.get("artistId") as string;
  const isPublished = formData.get("isPublished") === "on";

  const errors: Record<string, string> = {};

  if (!title) errors.title = "제목을 입력하세요";

  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

  try {
    if (albumId && albumId !== "new") {
      // Edit existing album - only if user has songs in it
      const existingAlbum = await db.album.findFirst({
        where: {
          id: albumId,
          songs: { some: { uploadedById: user.id } },
        },
      });

      if (!existingAlbum) {
        return json({ errors: { general: "권한이 없습니다." } });
      }

      await db.album.update({
        where: { id: albumId },
        data: {
          title,
          description: description || null,
          coverImage: coverImage || null,
          releaseDate: releaseDate ? new Date(releaseDate) : null,
          genre: genre || null,
          isPublished,
        },
      });

      // Update artist relationship if provided
      if (artistId) {
        await db.albumArtist.deleteMany({
          where: { albumId },
        });

        await db.albumArtist.create({
          data: {
            albumId,
            artistId,
            role: "Artist",
          },
        });
      }
    } else {
      // Create new album
      const album = await db.album.create({
        data: {
          title,
          description: description || null,
          coverImage: coverImage || null,
          releaseDate: releaseDate ? new Date(releaseDate) : null,
          genre: genre || null,
          isPublished,
          isApproved: false,
        },
      });

      // Add artist relationship if provided
      if (artistId) {
        await db.albumArtist.create({
          data: {
            albumId: album.id,
            artistId,
            role: "Artist",
          },
        });
      }
    }

    return redirect("/dashboard/albums");
  } catch (error) {
    console.error("Error saving album:", error);
    return json({ errors: { general: "앨범 저장 중 오류가 발생했습니다." } });
  }
}

export default function AlbumForm() {
  const { album, artists } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ errors?: Record<string, string> }>();
  const navigation = useNavigation();
  const isEditing = !!album;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link
              to="/dashboard/albums"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />← 앨범 관리
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditing ? "앨범 편집" : "새 앨범 만들기"}
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
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  앨범명 *
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  defaultValue={album?.title || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="앨범 제목을 입력하세요"
                />
                {actionData?.errors?.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {actionData.errors.title}
                  </p>
                )}
              </div>

              {/* Artist */}
              <div>
                <label
                  htmlFor="artistId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  아티스트
                </label>
                <select
                  id="artistId"
                  name="artistId"
                  defaultValue={album?.artists?.[0]?.artistId || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">아티스트를 선택하세요</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.stageName || artist.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Genre */}
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
                  defaultValue={album?.genre || ""}
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

              {/* Release Date */}
              <div>
                <label
                  htmlFor="releaseDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  발매일
                </label>
                <input
                  id="releaseDate"
                  type="date"
                  name="releaseDate"
                  defaultValue={
                    album?.releaseDate
                      ? new Date(album.releaseDate).toISOString().split("T")[0]
                      : ""
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
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
                defaultValue={album?.coverImage || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                설명
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={album?.description || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="앨범에 대한 설명을 입력하세요..."
              />
            </div>

            {/* Options */}
            <div className="flex items-center">
              <input
                id="isPublished"
                type="checkbox"
                name="isPublished"
                defaultChecked={album?.isPublished || false}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isPublished"
                className="ml-2 block text-sm text-gray-900"
              >
                공개하기
              </label>
            </div>

            {/* Songs in Album */}
            {album?.songs && album.songs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  수록곡
                </h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <ul className="space-y-2">
                    {album.songs.map((song, index) => (
                      <li
                        key={song.id}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <span className="w-6 text-center">{index + 1}.</span>
                        <span>{song.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Link
                to="/dashboard/albums"
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
                    {isEditing ? "수정 완료" : "앨범 만들기"}
                  </>
                )}
              </button>
            </div>
          </Form>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <div className="flex">
            <Album className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                앨범 만들기 안내
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    앨범을 만든 후 음악 업로드 시 해당 앨범을 선택할 수
                    있습니다.
                  </li>
                  <li>아티스트를 먼저 등록하면 앨범에 연결할 수 있습니다.</li>
                  <li>커버 이미지는 1:1 비율(정사각형)을 권장합니다.</li>
                  <li>공개된 앨범은 다른 사용자들이 볼 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
