import { createContext, useContext, useState, ReactNode } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string | { title: string };
  duration?: number;
  coverImage?: string;
  audioUrl: string;
  imageUrl?: string;
  theme?: string;
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
  console.log(playlist);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);

  const playTrack = (track: Track, newPlaylist?: Track[]) => {
    console.log(track, newPlaylist);
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
