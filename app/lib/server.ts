import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get album by ID
export async function getAlbumById(id: string) {
  return await prisma.album.findUnique({
    where: { id },
  });
}

// Get all albums (basic)
export async function getAllAlbums() {
  return await prisma.album.findMany();
}

// Get latest published and approved albums
export async function getLatestAlbums(limit = 8) {
  try {
    const albums = await prisma.album.findMany({
      where: { isPublished: true, isApproved: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        artists: {
          include: { artist: true },
        },
      },
    });

    return albums.map((album, index) => {
      // Determine if album is Korean based on genre or artist name patterns
      // This is just a simple heuristic - adjust as needed
      const artistNames = album.artists
        .map((aa) => aa.artist.stageName || aa.artist.name)
        .join(" ");

      // Simple heuristic: if genre contains K-Pop or artist name has Korean characters
      const hasKoreanChars =
        /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/.test(
          artistNames
        );
      const hasKpopGenre =
        album.genre?.includes("K-") ||
        album.genre?.toLowerCase().includes("k-pop");
      const isKorean = hasKoreanChars || hasKpopGenre;

      return {
        id: album.id,
        title: album.title,
        description: album.description,
        artist: album.artists
          .map((aa) => aa.artist.stageName || aa.artist.name)
          .join(", "),
        releaseDate: album.releaseDate
          ? album.releaseDate.toISOString().split("T")[0]
          : "2025.08.08",
        albumType: album.type || "ALBUM",
        imageUrl:
          album.coverImage ||
          `https://via.placeholder.com/150x150/ff6b6b/ffffff?text=${index + 1}`,
        rank: index + 1,
        isKorean: isKorean, // Determined by heuristic
        artists: album.artists,
        coverImage: album.coverImage,
        genre: album.genre,
        plays: album.plays,
        likes: album.likes,
      };
    });
  } catch (error) {
    console.error("Error fetching latest albums:", error);
    return [];
  }
}

// Get most played songs for chart
export async function getChartSongs(limit = 20) {
  try {
    const songs = await prisma.song.findMany({
      where: { isPublished: true, isApproved: true },
      orderBy: { plays: "desc" },
      take: limit,
      include: {
        artists: {
          include: { artist: true },
        },
      },
    });

    return songs.map((song, index) => ({
      id: song.id,
      rank: index + 1,
      change: Math.random() > 0.5 ? 1 : Math.random() > 0.5 ? -1 : 0,
      title: song.title,
      artist: song.artists
        .map((sa) => sa.artist.stageName || sa.artist.name)
        .join(", "),
      album: song.albumId ? "Album" : "Single",
      imageUrl:
        song.coverImage ||
        `https://via.placeholder.com/40x40/4ecdc4/ffffff?text=${index + 1}`,
      audioUrl: song.audioUrl,
    }));
  } catch (error) {
    console.error("Error fetching chart songs:", error);
    return [];
  }
}

// Get latest published and approved videos
export async function getLatestVideos(limit = 6) {
  try {
    const videos = await prisma.video.findMany({
      where: { isPublished: true, isApproved: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        artists: {
          include: { artist: true },
        },
      },
    });

    return videos.map((video, index) => ({
      id: video.id,
      title: video.title,
      artist: video.artists
        .map((va) => va.artist.stageName || va.artist.name)
        .join(", "),
      duration: video.duration
        ? `${Math.floor(video.duration / 60)}:${(video.duration % 60)
            .toString()
            .padStart(2, "0")}`
        : "3:45",
      rating: "전체 관람가",
      imageUrl:
        video.thumbnailUrl ||
        `https://via.placeholder.com/200x120/45b7d1/ffffff?text=Video${
          index + 1
        }`,
      views: Math.floor(Math.random() * 1000000),
      videoUrl: video.videoUrl,
    }));
  } catch (error) {
    console.error("Error fetching latest videos:", error);
    return [];
  }
}

// Get verified artists
export async function getFeaturedArtists(limit = 6) {
  try {
    const artists = await prisma.artist.findMany({
      where: { isVerified: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return artists.map((artist, index) => ({
      id: artist.id,
      artist: artist.stageName || artist.name,
      content:
        artist.bio ||
        `${artist.stageName || artist.name}의 특별한 이야기를 만나보세요.`,
      timestamp: `${index + 1}시간 전`,
      comments: Math.floor(Math.random() * 50) + 10,
      views: Math.floor(Math.random() * 1000) + 100,
    }));
  } catch (error) {
    console.error("Error fetching featured artists:", error);
    return [];
  }
}

// Get featured songs for PD albums
export async function getFeaturedSongs(limit = 8) {
  try {
    const songs = await prisma.song.findMany({
      where: { isPublished: true, isApproved: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        artists: {
          include: { artist: true },
        },
      },
    });

    return songs.map((song, index) => ({
      id: song.id,
      title: song.title,
      description: song.description || "추천 음악",
      curator: "Music PD",
      imageUrl:
        song.coverImage ||
        `https://via.placeholder.com/150x150/96ceb4/ffffff?text=PD${index + 1}`,
      trackCount: 1,
    }));
  } catch (error) {
    console.error("Error fetching featured songs:", error);
    return [];
  }
}

// Get albums for sidebar
export async function getSidebarAlbums(limit = 15) {
  try {
    const albums = await prisma.album.findMany({
      where: { isPublished: true, isApproved: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        coverImage: true,
        artists: {
          include: { artist: { select: { name: true, stageName: true } } },
        },
      },
    });

    return albums.map((album) => ({
      id: album.id,
      title: album.title,
      coverImage: album.coverImage,
      artists: album.artists,
    }));
  } catch (error) {
    console.error("Error fetching sidebar albums:", error);
    return [];
  }
}
