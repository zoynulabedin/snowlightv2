import { PrismaClient } from "@prisma/client";
import type { PlaylistItem, Song } from "@prisma/client";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { deleteFromCloudinary, getPublicIdFromUrl } from "./cloudinary";

const prisma = new PrismaClient();

// Get album by ID
export async function getAlbumById(id: string) {
  return await prisma.album.findUnique({
    where: { id },
    include: {
      songs: {
        include: {
          artists: { include: { artist: true } },
          album: true,
          uploadedBy: true,
          videos: true,
          favorites: true,
          playlistItems: true,
          uploads: true,
        },
      },
      artists: { include: { artist: true } },
      favorites: true,
    },
  });
}

// Get all albums (basic)
export async function getAllAlbums() {
  return await prisma.album.findMany({
    where: { isPublished: true, isApproved: true },
  });
}

// Get latest published and approved albums
export async function getLatestAlbums() {
  try {
    const albums = await prisma.album.findMany({
      where: { isPublished: true, isApproved: true },
      orderBy: { createdAt: "desc" },
      include: {
        artists: { include: { artist: true } },
        favorites: true,
        songs: {
          include: {
            artists: { include: { artist: true } },
            album: true,
            uploadedBy: true,
            videos: true,
            favorites: true,
            playlistItems: true,
            uploads: true,
          },
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
        imageUrl: album.coverImage || `https://placehold.co/150x150`,
        rank: index + 1,
        isKorean: isKorean, // Determined by heuristic
        artists: album.artists,
        coverImage: album.coverImage,
        genre: album.genre,
        plays: album.plays,
        likes: album.likes,
        favorites: album.favorites,
        songs: album.songs,
      };
    });
  } catch (error) {
    console.error("Error fetching latest albums:", error);
    return [];
  }
}

// Get most played songs for chart
export async function getChartSongs() {
  try {
    return await prisma.song.findMany({
      where: { isPublished: true, isApproved: true },
      orderBy: { plays: "desc" },
      include: {
        artists: { include: { artist: true } },
        album: true,
        uploadedBy: true,
        videos: true,
        favorites: true,
        playlistItems: true,
        uploads: true,
      },
    });
  } catch (error) {
    console.error("Error fetching chart songs:", error);
    return [];
  }
}

// Get latest published and approved videos
export async function getLatestVideos() {
  try {
    const videos = await prisma.video.findMany({
      where: { isPublished: true, isApproved: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        duration: true,
        thumbnailUrl: true,
        videoUrl: true,
        views: true,
        likes: true,
        isFeatured: true,
        isPublished: true,
        isApproved: true,
        createdAt: true,
        artists: {
          include: {
            artist: true,
          },
        },
        song: {
          include: {
            artists: { include: { artist: true } },
            album: true,
            uploadedBy: true,
            videos: true,
            favorites: true,
            playlistItems: true,
            uploads: true,
          },
        },
      },
    });

    return videos.map((video) => ({
      id: video.id,
      title: video.title,
      artist: video.artists
        .map((va) => va.artist.stageName || va.artist.name)
        .join(", "),
      duration: video.duration
        ? `${Math.floor(video.duration / 60)}:${(video.duration % 60)
            .toString()
            .padStart(2, "0")}`
        : "-",
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl, // Now this will be properly included
      views: video.views,
      likes: video.likes,
      isFeatured: video.isFeatured,
      isPublished: video.isPublished,
      isApproved: video.isApproved,
      createdAt: video.createdAt,
      song: video.song,
      artists: video.artists,
    }));
  } catch (error) {
    console.error("Error fetching latest videos:", error);
    return [];
  }
}
// Get verified artists
export async function getFeaturedArtists() {
  try {
    const artists = await prisma.artist.findMany({
      where: { isVerified: true },
      orderBy: { createdAt: "desc" },
    });

    return artists.map((artist, index) => ({
      id: artist.id,
      artist: artist.stageName || artist.name,
      content:
        artist.bio ||
        `${artist.stageName || artist.name}의 특별한 이야기를 만나보세요.`,
      timestamp: `${index + 1}시간 전`,
      coverImage: artist.coverImage,
      comments: Math.floor(Math.random() * 50) + 10,
      views: Math.floor(Math.random() * 1000) + 100,
    }));
  } catch (error) {
    console.error("Error fetching featured artists:", error);
    return [];
  }
}

// Get featured songs for PD albums
export async function getFeaturedSongs() {
  try {
    const songs = await prisma.song.findMany({
      where: {
        isPublished: true,
        isApproved: true,
        isFeatured: true,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        coverImage: true,
        artists: {
          include: {
            artist: true,
          },
        },
        album: true,
        uploadedBy: true,
        videos: true,
        favorites: true,
        playlistItems: true,
        uploads: true,
      },
    });

    return songs.map((song) => ({
      id: song.id,
      title: song.title,
      description: song.description || "추천 음악",
      curator: "Music PD",
      imageUrl: song.coverImage || "https://placehold.co/500x500/orange/white",
      trackCount: 1,
      artists: song.artists,
      albumData: song.album,
      uploadedBy: song.uploadedBy,
      videos: song.videos,
      favorites: song.favorites,
      playlistItems: song.playlistItems,
      uploads: song.uploads,
    }));
  } catch (error) {
    console.error("Error fetching featured songs:", error);
    return [];
  }
}

// Get albums for sidebar
export async function getSidebarAlbums() {
  try {
    const albums = await prisma.album.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        artists: {
          include: { artist: { select: { name: true, stageName: true } } },
        },
        favorites: true,
        songs: {
          include: {
            artists: { include: { artist: true } },
            album: true,
            uploadedBy: true,
            videos: true,
            favorites: true,
            playlistItems: true,
            uploads: true,
          },
        },
      },
    });

    return albums;
  } catch (error) {
    console.error("Error fetching sidebar albums:", error);
    return [];
  }
}

// Add song to playlist
export async function addSongToPlaylist({
  userId,
  songId,
}: {
  userId: string;
  playlistId: string;
  songId: string;
}) {
  try {
    // Check if already exists
    const exists = await prisma.playlistItem.findFirst({
      where: { userId, songId },
    });
    if (exists) return { error: "이미 플레이리스트에 있습니다." };
    // Add to playlist
    await prisma.playlistItem.create({
      data: {
        userId,
        songId,
        position: 0, // You may want to set position properly
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    return { error: "플레이리스트 추가 실패" };
  }
}

// Toggle song in playlist (add/remove)
export async function toggleSongInPlaylist({
  userId,
  songId,
}: {
  userId: string;
  playlistId: string;
  songId: string;
}) {
  try {
    const exists = await prisma.playlistItem.findFirst({
      where: { userId, songId },
    });
    if (exists) {
      await prisma.playlistItem.delete({ where: { id: exists.id } });
      return { removed: true };
    } else {
      await prisma.playlistItem.create({
        data: { songId, userId, position: 0 },
      });
      return { added: true };
    }
  } catch (error) {
    console.error("Error toggling song in playlist:", error);
    return { error: "플레이리스트 토글 실패" };
  }
}

// Download song (returns song info for download)
export async function getSongDownloadInfo(songId: string) {
  try {
    const song = await prisma.song.findUnique({
      where: { id: songId },
      select: { id: true, title: true, audioUrl: true },
    });
    if (!song) return { error: "노래를 찾을 수 없습니다." };
    return song;
  } catch (error) {
    console.error("Error getting song download info:", error);
    return { error: "다운로드 정보 조회 실패" };
  }
}

// Add song to favorites
export async function addSongToFavorite({
  userId,
  songId,
}: {
  userId: string;
  songId: string;
}) {
  try {
    // Check if already exists
    const exists = await prisma.favorite.findFirst({
      where: { userId, songId },
    });
    if (exists) return { error: "이미 즐겨찾기에 있습니다." };
    await prisma.favorite.create({
      data: { userId, songId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error adding song to favorite:", error);
    return { error: "즐겨찾기 추가 실패" };
  }
}

// Toggle song favorite (add/remove)
export async function toggleSongFavorite({
  userId,
  songId,
}: {
  userId: string;
  songId: string;
}) {
  try {
    const exists = await prisma.favorite.findFirst({
      where: { userId, songId },
    });
    if (exists) {
      await prisma.favorite.delete({ where: { id: exists.id } });
      return { removed: true };
    } else {
      await prisma.favorite.create({ data: { userId, songId } });
      return { added: true };
    }
  } catch (error) {
    console.error("Error toggling song favorite:", error);
    return { error: "즐겨찾기 토글 실패" };
  }
}

// Find favorites by userId
export async function findFavoritesByUserId(userId: string) {
  try {
    return await prisma.favorite.findMany({ where: { userId } });
  } catch (error) {
    console.error("Error finding favorites by userId:", error);
    return [];
  }
}

// More actions placeholder (extend as needed)
export async function songMoreActions() {
  // Implement custom logic for 'more' actions
  return { success: true, message: "더보기 기능은 곧 제공됩니다." };
}

// Reusable function: get all playlists for a user
export async function getUserPlaylists(userId: string) {
  try {
    return await prisma.playlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching user playlists:", error);
    return [];
  }
}

// Reusable function: get playlist by id
export async function getPlaylistById(playlistId: string) {
  try {
    return await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { items: true },
    });
  } catch (error) {
    console.error("Error fetching playlist by id:", error);
    return null;
  }
}

// Reusable function: get playlist items for a playlist
export async function getPlaylistItems(playlistId: string) {
  try {
    return await prisma.playlistItem.findMany({
      where: { playlistId },
      orderBy: { position: "asc" },
    });
  } catch (error) {
    console.error("Error fetching playlist items:", error);
    return [];
  }
}

// Find playlist items by userId
export async function findPlaylistItemsByUserId(userId: string) {
  try {
    return await prisma.playlistItem.findMany({
      where: { userId },
      include: {
        song: true,
      },
    });
  } catch (error) {
    console.error("Error finding playlist items by userId:", error);
    return [];
  }
}

// Get all playlists
export async function getAllPlaylistItems(): Promise<
  (PlaylistItem & { song: Song | null })[]
> {
  try {
    return await prisma.playlistItem.findMany({
      include: {
        song: {
          include: {
            album: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all playlists:", error);
    return [];
  }
}

// Create a new video
export async function createVideo({
  title,
  description,
  videoUrl,
  thumbnailUrl,
  genre,
  artistId,
  songId,
}: {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  genre?: string;
  artistId: string;
  songId: string;
}) {
  try {
    const video = await prisma.video.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        genre,
        songId,
        artists: {
          create: [
            {
              artist: {
                connect: { id: artistId },
              },
            },
          ],
        },
      },
    });
    return { success: true, video };
  } catch (error) {
    console.error("Error creating video:", error);
    return { error: "Failed to create video" };
  }
}

// Update an existing video
export async function updateVideo({
  id,
  ...data
}: {
  id: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  genre?: string;
  artistId?: string;
  songId?: string;
}) {
  try {
    // Prepare update data without artistId
    const updateData: any = {};

    if (data.title) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.thumbnailUrl !== undefined)
      updateData.thumbnailUrl = data.thumbnailUrl;
    if (data.genre !== undefined) updateData.genre = data.genre;

    // Handle song relationship
    if (data.songId !== undefined) {
      updateData.song = data.songId
        ? { connect: { id: data.songId } }
        : { disconnect: true };
    }

    // Handle artist relationship through VideoArtist
    if (data.artistId) {
      updateData.artists = {
        deleteMany: {}, // Remove existing artist relationships
        create: [
          {
            artist: {
              connect: { id: data.artistId },
            },
          },
        ],
      };
    }

    const video = await prisma.video.update({
      where: { id },
      data: updateData,
      include: {
        artists: {
          include: {
            artist: true,
          },
        },
        song: true,
      },
    });

    return { video };
  } catch (error) {
    console.error("Error updating video:", error);
    return { error: "Failed to update video" };
  }
}

// Delete a video
export async function deleteVideo(id: string) {
  try {
    const video = await prisma.video.findUnique({
      where: { id },
      select: { videoUrl: true, thumbnailUrl: true },
    });

    if (!video) {
      return { error: "Video not found" };
    }

    await prisma.video.delete({ where: { id } });

    return {
      success: true,
      deletedUrls: {
        video: video.videoUrl,
        thumbnail: video.thumbnailUrl,
      },
    };
  } catch (error) {
    console.error("Error deleting video:", error);
    return { error: "Failed to delete video" };
  }
}

// Toggle video publish status
export async function toggleVideoPublish(id: string) {
  try {
    const video = await prisma.video.findUnique({
      where: { id },
      select: { isPublished: true },
    });

    if (!video) {
      return { error: "Video not found" };
    }

    const updatedVideo = await prisma.video.update({
      where: { id },
      data: { isPublished: !video.isPublished },
    });

    return { success: true, isPublished: updatedVideo.isPublished };
  } catch (error) {
    console.error("Error toggling video publish status:", error);
    return { error: "Failed to update video status" };
  }
}

// Define ActionResponse type at the top of the file or import it if available
type ActionResponse = {
  success?: string;
  error?: string;
};

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const videoId = formData.get("videoId") as string;

  if (!videoId) {
    return json<ActionResponse>(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  switch (intent) {
    case "create": {
      const title = formData.get("title") as string;
      const artistId = formData.get("artistId") as string;
      const genre = (formData.get("genre") as string) || undefined;
      const description = (formData.get("description") as string) || undefined;
      const videoUrl = formData.get("videoUrl") as string;
      const thumbnailUrl = formData.get("thumbnailUrl") as string;
      const songId = formData.get("songId") as string;

      if (!title || !artistId || !videoUrl || !songId) {
        return json<ActionResponse>(
          { error: "Required fields are missing" },
          { status: 400 }
        );
      }

      const result = await createVideo({
        title,
        description,
        videoUrl,
        thumbnailUrl,
        genre,
        artistId,
        songId,
      });

      if ("error" in result) {
        return json<ActionResponse>({ error: result.error }, { status: 500 });
      }

      return json<ActionResponse>({ success: "Video created successfully" });
    }

    case "edit": {
      const title = formData.get("title") as string;
      const artistId = formData.get("artistId") as string;
      const songId = (formData.get("songId") as string) || undefined;
      const genre = (formData.get("genre") as string) || undefined;
      const description = (formData.get("description") as string) || undefined;
      const videoUrl = formData.get("videoUrl") as string;
      const thumbnailUrl = formData.get("thumbnailUrl") as string;

      const result = await updateVideo({
        id: videoId,
        title,
        description,
        videoUrl,
        thumbnailUrl,
        genre,
        artistId,
        songId,
      });

      if ("error" in result) {
        return json<ActionResponse>({ error: result.error }, { status: 500 });
      }

      return json<ActionResponse>({ success: "Video updated successfully" });
    }

    case "toggle-publish": {
      const result = await toggleVideoPublish(videoId);

      if ("error" in result) {
        return json<ActionResponse>({ error: result.error }, { status: 404 });
      }

      return json<ActionResponse>({
        success: "Video status updated successfully",
      });
    }

    case "delete": {
      const result = await deleteVideo(videoId);

      if ("error" in result) {
        return json<ActionResponse>({ error: result.error }, { status: 404 });
      }

      // Delete files from Cloudinary if URLs exist
      if (result.deletedUrls.video) {
        const videoId = getPublicIdFromUrl(result.deletedUrls.video);
        if (videoId) {
          await deleteFromCloudinary(videoId);
        }
      }

      if (result.deletedUrls.thumbnail) {
        const thumbnailId = getPublicIdFromUrl(result.deletedUrls.thumbnail);
        if (thumbnailId) {
          await deleteFromCloudinary(thumbnailId);
        }
      }

      return json<ActionResponse>({ success: "Video deleted successfully" });
    }

    default:
      return json<ActionResponse>({ error: "Invalid intent" }, { status: 400 });
  }
}
