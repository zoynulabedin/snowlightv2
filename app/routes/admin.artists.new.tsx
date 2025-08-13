import { json, ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await validateSession(request);
  
  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Response("Unauthorized", { status: 401 });
  }

  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await validateSession(request);
  
  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const stageName = formData.get("stageName") as string;
  const bio = formData.get("bio") as string;
  const avatar = formData.get("avatar") as string;
  const coverImage = formData.get("coverImage") as string;
  const genre = formData.get("genre") as string;
  const country = formData.get("country") as string;
  const debutYear = formData.get("debutYear") as string;
  const isVerified = formData.get("isVerified") === "on";

  try {
    const artist = await db.artist.create({
      data: {
        name,
        stageName: stageName || null,
        bio: bio || null,
        avatar: avatar || null,
        coverImage: coverImage || null,
        genre: genre || null,
        country: country || null,
        debutYear: debutYear ? parseInt(debutYear) : null,
        isVerified
      }
    });

    return redirect("/admin?tab=artists&success=created");
  } catch (error) {
    return json({ error: "아티스트 생성에 실패했습니다." }, { status: 400 });
  }
}

export default function NewArtist() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">새 아티스트 추가</h1>
          <p className="text-gray-600">새로운 아티스트를 플랫폼에 추가합니다</p>
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                실명 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="아티스트의 실명을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="stageName" className="block text-sm font-medium text-gray-700 mb-2">
                예명/활동명
              </label>
              <input
                type="text"
                id="stageName"
                name="stageName"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="예명 또는 활동명을 입력하세요"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                주요 장르
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
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                국가
              </label>
              <select
                id="country"
                name="country"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="">국가 선택</option>
                <option value="대한민국">대한민국</option>
                <option value="미국">미국</option>
                <option value="일본">일본</option>
                <option value="중국">중국</option>
                <option value="영국">영국</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div>
              <label htmlFor="debutYear" className="block text-sm font-medium text-gray-700 mb-2">
                데뷔 연도
              </label>
              <input
                type="number"
                id="debutYear"
                name="debutYear"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="2023"
              />
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
                프로필 이미지 URL
              </label>
              <input
                type="url"
                id="avatar"
                name="avatar"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
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

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              아티스트 소개
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="아티스트에 대한 소개를 입력하세요"
            />
          </div>

          {/* Verification */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">인증 설정</h3>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVerified"
                name="isVerified"
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <label htmlFor="isVerified" className="text-sm text-gray-700">
                인증된 아티스트로 설정
              </label>
            </div>
            <p className="text-xs text-gray-500">
              인증된 아티스트는 프로필에 인증 배지가 표시됩니다.
            </p>
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
              아티스트 추가
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

