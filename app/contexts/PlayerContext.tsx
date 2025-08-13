import { createContext, useContext, useState, ReactNode } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  coverUrl?: string;
  audioUrl: string;
  imageUrl?: string;
}

export interface Video {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnailUrl: string;
  videoUrl: string;
}

interface PlayerContextType {
  // Audio Player State
  currentTrack: Track | null;
  playlist: Track[];
  isAudioPlayerVisible: boolean;

  // Video Player State
  currentVideo: Video | null;
  isVideoPlayerVisible: boolean;

  // Actions
  playTrack: (track: Track, playlist?: Track[]) => void;
  playVideo: (video: Video) => void;
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: string) => void;
  clearPlaylist: () => void;
  closeAudioPlayer: () => void;
  closeVideoPlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isAudioPlayerVisible, setIsAudioPlayerVisible] = useState(false);

  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);

  const playTrack = (track: Track, newPlaylist?: Track[]) => {
    setCurrentTrack(track);
    if (newPlaylist) {
      setPlaylist(newPlaylist);
    } else if (playlist.length === 0) {
      setPlaylist([track]);
    }
    setIsAudioPlayerVisible(true);
    // Close video player if open
    setIsVideoPlayerVisible(false);
  };

  const playVideo = (video: Video) => {
    setCurrentVideo(video);
    setIsVideoPlayerVisible(true);
    // Close audio player if open
    setIsAudioPlayerVisible(false);
  };

  const addToPlaylist = (track: Track) => {
    setPlaylist((prev) => {
      // Check if track already exists
      if (prev.some((t) => t.id === track.id)) {
        return prev;
      }
      return [...prev, track];
    });
  };

  const removeFromPlaylist = (trackId: string) => {
    setPlaylist((prev) => prev.filter((track) => track.id !== trackId));
  };

  const clearPlaylist = () => {
    setPlaylist([]);
    setCurrentTrack(null);
    setIsAudioPlayerVisible(false);
  };

  const closeAudioPlayer = () => {
    setIsAudioPlayerVisible(false);
  };

  const closeVideoPlayer = () => {
    setIsVideoPlayerVisible(false);
  };

  const value: PlayerContextType = {
    currentTrack,
    playlist,
    isAudioPlayerVisible,
    currentVideo,
    isVideoPlayerVisible,
    playTrack,
    playVideo,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    closeAudioPlayer,
    closeVideoPlayer,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}

// Mock data for testing
export const mockTracks: Track[] = [
  {
    id: "1",
    title: "서우젯소리",
    artist: "사우스 카니발(South Carnival)",
    album: "서우젯소리",
    duration: 332, // 5:32
    coverUrl:
      "https://via.placeholder.com/300x300/ff1493/ffffff?text=서우젯소리",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Demo audio
  },
  {
    id: "2",
    title: "Golden",
    artist: "HUNTR/X",
    album: "KPop Demon Hunters",
    duration: 245, // 4:05
    coverUrl: "https://via.placeholder.com/300x300/ff1493/ffffff?text=Golden",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  },
  {
    id: "3",
    title: "뛰어(JUMP)",
    artist: "BLACKPINK",
    album: "뛰어(JUMP)",
    duration: 198, // 3:18
    coverUrl: "https://via.placeholder.com/300x300/ff1493/ffffff?text=JUMP",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  },
];

export const mockVideos: Video[] = [
  {
    id: "1",
    title: "서우젯소리 뮤직비디오",
    artist: "사우스 카니발(South Carnival)",
    duration: 332,
    thumbnailUrl:
      "https://via.placeholder.com/640x360/ff1493/ffffff?text=서우젯소리+MV",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: "2",
    title: "Golden 뮤직비디오",
    artist: "HUNTR/X",
    duration: 245,
    thumbnailUrl:
      "https://via.placeholder.com/640x360/ff1493/ffffff?text=Golden+MV",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
];
