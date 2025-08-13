import { json, LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/lib/db";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return json({
      songs: [],
      albums: [],
      artists: [],
      videos: [],
    });
  }

  try {
    // Search songs
    const songs = await db.song.findMany({
      where: {
        title: { contains: query.trim(), mode: "insensitive" },
      },
      include: {
        album: true,
        artists: {
          include: {
            artist: true,
          },
        },
      },
      take: 5,
    });

    // Search albums
    const albums = await db.album.findMany({
      where: {
        title: { contains: query.trim(), mode: "insensitive" },
      },
      include: {
        artists: {
          include: {
            artist: true,
          },
        },
      },
      take: 5,
    });

    // Search artists
    const artists = await db.artist.findMany({
      where: {
        OR: [
          { name: { contains: query.trim(), mode: "insensitive" } },
          { stageName: { contains: query.trim(), mode: "insensitive" } },
        ],
      },
      take: 5,
    });

    // Search videos
    const videos = await db.video.findMany({
      where: {
        title: { contains: query.trim(), mode: "insensitive" },
      },
      include: {
        artists: {
          include: {
            artist: true,
          },
        },
      },
      take: 5,
    });

    return json({
      songs: songs.map((song) => ({
        id: song.id,
        title: song.title,
        artist:
          song.artists.length > 0
            ? song.artists[0].artist.name
            : "Unknown Artist",
        album: song.album?.title || "",
        imageUrl:
          song.coverImage || "https://via.placeholder.com/64x64?text=Song",
        duration: song.duration || 0,
      })),
      albums: albums.map((album) => ({
        id: album.id,
        title: album.title,
        artist:
          album.artists.length > 0
            ? album.artists[0].artist.name
            : "Unknown Artist",
        imageUrl:
          album.coverImage || "https://via.placeholder.com/64x64?text=Album",
        releaseDate: album.releaseDate || new Date(),
        songCount: Math.floor(Math.random() * 15) + 1,
      })),
      artists: artists.map((artist) => ({
        id: artist.id,
        name: artist.stageName || artist.name,
        imageUrl:
          artist.avatar || "https://via.placeholder.com/64x64?text=Artist",
        followers: artist.followers,
      })),
      videos: videos.map((video) => ({
        id: video.id,
        title: video.title,
        artist:
          video.artists.length > 0
            ? video.artists[0].artist.name
            : "Unknown Artist",
        imageUrl:
          video.thumbnailUrl || "https://via.placeholder.com/64x64?text=Video",
        duration: video.duration || 0,
        views: video.views || 0,
      })),
    });
  } catch (error) {
    console.error("Search error:", error);
    return json(
      {
        songs: [],
        albums: [],
        artists: [],
        videos: [],
        error: "Search failed",
      },
      { status: 500 }
    );
  }
}
