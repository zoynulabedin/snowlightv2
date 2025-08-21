import { useState } from "react";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Layout from "~/components/Layout";
import { useLanguage } from "~/contexts/LanguageContext";
import { db } from "~/lib/db";

// Define the album type
interface Album {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  releaseDate: string | null;
  genre: string | null;
  type: string;
  artists: {
    artist: {
      name: string;
      stageName?: string | null;
    };
  }[];
}

// Get all albums from the database
export async function loader() {
  try {
    const albums = await db.album.findMany({
      where: { isPublished: true, isApproved: true },
      orderBy: { createdAt: "desc" },
      include: {
        artists: {
          include: { artist: true },
        },
      },
    });

    // Transform data for display
    const transformedAlbums = albums.map((album) => ({
      id: album.id,
      title: album.title,
      description: album.description,
      coverImage: album.coverImage,
      releaseDate: album.releaseDate
        ? album.releaseDate.toISOString().split("T")[0]
        : null,
      genre: album.genre,
      type: album.type,
      artists: album.artists,
    }));

    return json({ albums: transformedAlbums });
  } catch (error) {
    console.error("Error fetching albums:", error);
    return json({ albums: [] });
  }
}

export default function AlbumsPage() {
  const { albums } = useLoaderData<typeof loader>();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter albums based on search term
  const filteredAlbums = albums.filter(
    (album) =>
      album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (album.description &&
        album.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      album.artists.some(
        (a) =>
          (a.artist.stageName &&
            a.artist.stageName
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          a.artist.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("albums.all_albums")}
          </h1>
          <div className="relative w-64">
            <input
              type="text"
              placeholder={t("common.search")}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <Link to={`/album/${album.id}`}>
                <div className="relative pt-[100%]">
                  <img
                    src={
                      album.coverImage ||
                      "https://placehold.co/300x300?text=No+Cover"
                    }
                    alt={album.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                    {album.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {album.artists
                      .map((a) => a.artist.stageName || a.artist.name)
                      .join(", ")}
                  </p>
                  {album.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {album.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>{album.releaseDate}</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {album.type}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {filteredAlbums.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">
              {searchTerm ? t("albums.no_albums_found") : t("albums.no_albums")}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
