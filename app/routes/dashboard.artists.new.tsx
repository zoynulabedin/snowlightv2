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

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  return { user };
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    await requireAdmin(request);

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

    // Check if artist already exists
    const existingArtist = await db.artist.findFirst({
      where: {
        OR: [{ name: name }, ...(stageName ? [{ stageName: stageName }] : [])],
      },
    });

    if (existingArtist) {
      return json(
        { error: "Artist with this name already exists" },
        { status: 400 }
      );
    }

    // Create new artist
    const newArtist = await db.artist.create({
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

    return redirect(`/dashboard/artists?created=${newArtist.id}`);
  } catch (error) {
    console.error("Create artist error:", error);
    return json({ error: "Failed to create artist" }, { status: 500 });
  }
}

export default function CreateArtist() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [formData, setFormData] = useState({
    name: "",
    stageName: "",
    genre: "",
    country: "",
    bio: "",
    debutYear: "",
    avatar: "",
    coverImage: "",
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
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Artist
                </h1>
                <p className="text-gray-600 mt-1">
                  Add a new artist to the platform
                </p>
              </div>
              <Link
                to="/dashboard/artists"
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Artists
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          <div className="max-w-2xl mx-auto">
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

            {/* Create Form */}
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
                        placeholder="Enter artist's real name"
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
                        placeholder="Enter stage/performance name"
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
                        placeholder="e.g., 2023"
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
                    placeholder="Brief description about the artist..."
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
                        placeholder="https://example.com/avatar.jpg"
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
                        placeholder="https://example.com/cover.jpg"
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
                    Create Artist
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
