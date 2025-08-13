import { json, ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData, useActionData } from "@remix-run/react";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";
import Layout from "~/components/Layout";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await validateSession(request);
  
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Get user's artist profile
  const artist = await db.artist.findUnique({
    where: { userId: user.id }
  });

  if (!artist) {
    throw new Response("Artist profile not found", { status: 404 });
  }

  return json({ user, artist });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await validateSession(request);
  
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Get user's artist profile
  const artist = await db.artist.findUnique({
    where: { userId: user.id }
  });

  if (!artist) {
    throw new Response("Artist profile not found", { status: 404 });
  }

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const coverImage = formData.get("coverImage") as string;
  const releaseDate = formData.get("releaseDate") as string;
  const genre = formData.get("genre") as string;
  const type = formData.get("type") as string;

  try {
    // Create the album
    const album = await db.album.create({
      data: {
        title,
        description: description || null,
        coverImage: coverImage || null,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        genre: genre || null,
        type: type as any || 'ALBUM',
        isPublished: false, // Artists need approval
        isApproved: false,
        isFeatured: false
      }
    });

    // Add artist relationship
    await db.albumArtist.create({
      data: {
        albumId: album.id,
        artistId: artist.id,
        role: "Artist"
      }
    });

    return redirect("/artist/dashboard?tab=albums&success=created");
  } catch (error) {
    return json({ error: "앨범 생성에 실패했습니다." }, { status: 400 });
  }
}

export default function NewArtistAlbum() {
  const { user, artist } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">새 앨범 생성</h1>
            <p className="text-gray-600">{artist.stageName || artist.name}의 새로운 앨범을 생성합니다</p>
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
                  앨범 제목 *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="앨범 제목을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  앨범 타입 *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="SINGLE">싱글</option>
                  <option value="EP">EP</option>
                  <option value="ALBUM">정규앨범</option>
                  <option value="COMPILATION">컴필레이션</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                  장르
                </label>
                <select
                  id="genre"
                  name="genre"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                  발매일
                </label>
                <input
                  type="date"
                  id="releaseDate"
                  name="releaseDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
                커버 이미지 URL
              </label>
              <input
                type="url"
                id="coverImage"
                name="coverImage"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="https://example.com/cover.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                권장 크기: 1000x1000 픽셀 이상의 정사각형 이미지
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                앨범 설명
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="앨범에 대한 설명을 입력하세요"
              />
            </div>

            {/* Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-400">ℹ️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    앨범 승인 안내
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      생성된 앨범은 관리자 승인 후 공개됩니다. 승인까지 1-2일 정도 소요될 수 있습니다.
                    </p>
                  </div>
                </div>
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
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                앨범 생성
              </button>
            </div>
          </Form>
        </div>
      </div>
    </Layout>
  );
}

