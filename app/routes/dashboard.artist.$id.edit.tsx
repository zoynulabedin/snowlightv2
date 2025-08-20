import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
  json,
} from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link } from "@remix-run/react";
import { useState } from "react";
import { db } from "~/lib/db";
import { requireAdmin } from "~/lib/auth";
import DashboardSidebar from "~/components/DashboardSidebar";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const artistId = params.id;

  if (!artistId) {
    throw new Response("Artist ID is required", { status: 400 });
  }

  const artist = await db.artist.findUnique({
    where: { id: artistId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      albumArtists: {
        include: {
          album: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      songArtists: {
        include: {
          song: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!artist) {
    throw new Response("Artist not found", { status: 404 });
  }

  return { user, artist };
}

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    await requireAdmin(request);
    const artistId = params.id;

    if (!artistId) {
      return json({ error: "Artist ID is required" }, { status: 400 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const stageName = formData.get("stageName") as string;
    const genre = formData.get("genre") as string;
    const country = formData.get("country") as string;
    const bio = formData.get("bio") as string;
    const debutYear = formData.get("debutYear") as string;
    const avatar = formData.get("avatar") as string;
    const coverImage = formData.get("coverImage") as string;

    // Validation
    if (!name) {
      return json({ error: "Artist name is required" }, { status: 400 });
    }

    // Check if another artist already exists with the same name
    const existingArtist = await db.artist.findFirst({
      where: {
        AND: [
          { id: { not: artistId } },
          {
            OR: [
              { name: name },
              ...(stageName ? [{ stageName: stageName }] : []),
            ],
          },
        ],
      },
    });

    if (existingArtist) {
      return json(
        { error: "Another artist with this name already exists" },
        { status: 400 }
      );
    }

    // Update artist
    await db.artist.update({
      where: { id: artistId },
      data: {
        name,
        stageName: stageName || null,
        genre: genre || null,
        country: country || null,
        bio: bio || null,
        debutYear: debutYear ? parseInt(debutYear) : null,
        avatar: avatar || null,
        coverImage: coverImage || null,
      },
    });

    return redirect(`/dashboard/artists?updated=${artistId}`);
  } catch (error) {
    console.error("Update artist error:", error);
    return json({ error: "Failed to update artist" }, { status: 500 });
  }
}

export default function EditArtist() {
  const { user, artist } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [formData, setFormData] = useState({
    name: artist.name,
    stageName: artist.stageName || "",
    genre: artist.genre || "",
    country: artist.country || "",
    bio: artist.bio || "",
    debutYear: artist.debutYear?.toString() || "",
    avatar: artist.avatar || "",
    coverImage: artist.coverImage || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Error Message */}
        {actionData?.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="ml-3 text-red-800">{actionData.error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Artist Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                {artist.avatar ? (
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="h-16 w-16 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    {artist.stageName || artist.name}
                    {artist.isVerified && (
                      <svg
                        className="w-5 h-5 text-blue-500 ml-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </h3>
                  <p className="text-gray-500">{artist.genre || "No genre"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Followers:</span>
                  <span className="font-medium">
                    {artist.followers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Listeners:</span>
                  <span className="font-medium">
                    {artist.monthlyListeners.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Songs:</span>
                  <span className="font-medium">
                    {artist.songArtists.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Albums:</span>
                  <span className="font-medium">
                    {artist.albumArtists.length}
                  </span>
                </div>
                {artist.user && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">User Account:</p>
                    <p className="font-medium">{artist.user.username}</p>
                    <p className="text-sm text-gray-500">{artist.user.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <Form method="post" className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Artist Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Artist Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Stage Name */}
                    <div>
                      <label
                        htmlFor="stageName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Stage Name
                      </label>
                      <input
                        type="text"
                        id="stageName"
                        name="stageName"
                        value={formData.stageName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Genre */}
                    <div>
                      <label
                        htmlFor="genre"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Genre
                      </label>
                      <select
                        id="genre"
                        name="genre"
                        value={formData.genre}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Genre</option>
                        <option value="K-Pop">K-Pop</option>
                        <option value="K-Rock">K-Rock</option>
                        <option value="K-Hip Hop">K-Hip Hop</option>
                        <option value="K-R&B">K-R&B</option>
                        <option value="K-Indie">K-Indie</option>
                        <option value="Trot">Trot</option>
                        <option value="Ballad">Ballad</option>
                        <option value="Electronic">Electronic</option>
                        <option value="Folk">Folk</option>
                        <option value="Jazz">Jazz</option>
                        <option value="Classical">Classical</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Country */}
                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Country
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Country</option>
                        <option value="South Korea">South Korea</option>
                        <option value="North Korea">North Korea</option>
                        <option value="United States">United States</option>
                        <option value="Japan">Japan</option>
                        <option value="China">China</option>
                        <option value="Thailand">Thailand</option>
                        <option value="Philippines">Philippines</option>
                        <option value="Indonesia">Indonesia</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Vietnam">Vietnam</option>
                        <option value="India">India</option>
                        <option value="Australia">Australia</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Debut Year */}
                    <div>
                      <label
                        htmlFor="debutYear"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Debut Year
                      </label>
                      <input
                        type="number"
                        id="debutYear"
                        name="debutYear"
                        value={formData.debutYear}
                        onChange={handleInputChange}
                        min="1950"
                        max={new Date().getFullYear()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Biography */}
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Biography
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Media */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Media
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Avatar URL */}
                    <div>
                      <label
                        htmlFor="avatar"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Avatar Image URL
                      </label>
                      <input
                        type="url"
                        id="avatar"
                        name="avatar"
                        value={formData.avatar}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Cover Image URL */}
                    <div>
                      <label
                        htmlFor="coverImage"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Cover Image URL
                      </label>
                      <input
                        type="url"
                        id="coverImage"
                        name="coverImage"
                        value={formData.coverImage}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Link
                    to="/dashboard/artists"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Update Artist
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
