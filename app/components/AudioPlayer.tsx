import { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Download,
  MoreHorizontal,
  Maximize2,
  List,
  X,
  Minus,
} from "lucide-react";
import { usePlayer, Track } from "~/contexts/PlayerContext";

export type AudioPlayerProps = {
  userId?: string;
  onClose?: () => void;
};

export default function AudioPlayer({ userId }: AudioPlayerProps) {
  const {
    currentTrack,
    playlist,
    removeFromPlaylist,
    closeAudioPlayer,
    playTrack,
  } = usePlayer();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off");
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isExpanded, setIsExpanded] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressRef2 = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const volumeRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack?.audioUrl || "";
      audioRef.current.load();
      setIsPlaying(false); // Stop playback when src changes
    }
    if (currentTrack?.duration) setAudioDuration(currentTrack.duration);
  }, [currentTrack]);

  const handleNext = useCallback(() => {
    if (playlist.length === 0) return;
    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
    }
    const nextTrack = playlist[nextIndex];
    if (nextTrack) {
      playTrack(nextTrack, playlist);
    }
  }, [playlist, isShuffled, currentIndex, playTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setIsPlaying(false);
    };
    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else if (repeatMode === "all" || currentIndex < playlist.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [repeatMode, currentIndex, playlist.length, handleNext]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Sync currentIndex with currentTrack
  useEffect(() => {
    if (!currentTrack || playlist.length === 0) return;
    const idx = playlist.findIndex((t) => t.id === currentTrack.id);
    if (idx !== -1) setCurrentIndex(idx);
  }, [currentTrack, playlist]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDuration = (dur: number) => {
    const minutes = Math.floor(dur / 60);
    const seconds = Math.floor(dur % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Common function to handle seeking
  const seekTo = (time: number) => {
    if (!audioRef.current || !currentTrack?.duration) return;
    const newTime = Math.min(Math.max(0, time), currentTrack.duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Get the clicked element's ref
    const clickedRef =
      e.currentTarget === progressRef.current ? progressRef : progressRef2;

    if (!clickedRef.current || !currentTrack?.duration) return;

    const rect = clickedRef.current.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    const newTime = percentage * currentTrack.duration;

    if (audioRef.current) {
      const clampedTime = Math.min(Math.max(0, newTime), currentTrack.duration);
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  };

  // Fix play/pause toggle to ensure sync between player states
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
    }
  };

  const handlePrevious = () => {
    if (playlist.length === 0) return;
    if (currentTime > 3) {
      seekTo(0);
    } else {
      const prevIndex =
        currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
      const prevTrack = playlist[prevIndex];
      if (prevTrack) {
        playTrack(prevTrack, playlist);
      }
    }
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Get the clicked element's ref
    const clickedRef =
      e.currentTarget === volumeRef.current ? volumeRef : volumeRef2;

    if (!clickedRef.current) return;

    const rect = clickedRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, clickX / rect.width));

    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    const modes: ("off" | "one" | "all")[] = ["off", "one", "all"];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  // Fix handlePlaylistTrack to update currentIndex
  const handlePlaylistTrack = (track: Track) => {
    playTrack(track, playlist);
    const idx = playlist.findIndex((t) => t.id === track.id);
    if (idx !== -1) setCurrentIndex(idx);
  };
  const handleRemoveFromPlaylist = async (track: Track) => {
    const res = await fetch(
      `/api/removeplaylistitem?userId=${userId || ""}&songId=${track.id}`,
      { method: "GET" }
    );
    const result = await res.json();
    console.log(result);
    if (result.success) {
      // Remove from local playlist using context method if available
      if (typeof removeFromPlaylist === "function") {
        removeFromPlaylist(track.id);
      }
    } else {
      console.log(result.error || "Failed to remove song from playlist.");
    }
  };
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only show player if audio is available
  if (!currentTrack?.audioUrl) return null;

  const theme = currentTrack?.theme || undefined;

  // Only render portal on client
  if (!isClient) return null;
  return ReactDOM.createPortal(
    <>
      <audio ref={audioRef} src={currentTrack.audioUrl}>
        <track kind="captions" srcLang="en" label="English captions" />
      </audio>
      {/* Bottom Player */}
      <div
        className="fixed bottom-0 bg-opacity-90 backdrop-blur-2xl  left-0 right-0 border-t bg-white bg-blend-overlay border-gray-200 shadow-lg z-[12000]"
        style={{
          backgroundImage: currentTrack?.coverImage
            ? `url(${currentTrack.coverImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Progress Bar */}
        <div
          ref={progressRef2}
          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer mb-2"
          onClick={handleProgressClick}
          role="slider"
          tabIndex={0}
          aria-valuenow={currentTime}
          aria-valuemin={0}
          aria-valuemax={currentTrack?.duration || 0}
          aria-label="Audio progress"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              seekTo(Math.max(0, currentTime - 5));
            } else if (e.key === "ArrowRight") {
              seekTo(Math.min(currentTrack?.duration || 0, currentTime + 5));
            }
          }}
        >
          <div
            className="h-full bg-Snowlight-pink transition-all duration-100"
            style={{
              width:
                (currentTrack?.duration ?? 0) > 0
                  ? `${(currentTime / (currentTrack?.duration ?? 0)) * 100}%`
                  : "0%",
            }}
          />
        </div>
        <div className="mx-auto px-4">
          <div className="grid grid-cols-3 max-sm:grid-cols-1 max-sm:grid-rows-2 max-sm:items-center max-sm:justify-center items-center justify-between py-3">
            {/* Track Info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0 max-sm:justify-between">
              <img
                src={currentTrack?.coverImage || "https://placehold.co/600x400"}
                alt={currentTrack?.title}
                className={`w-12 h-12 rounded-md object-cover ${
                  theme ? `border-2 border-${theme}` : ""
                }`}
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {currentTrack?.title}
                </h4>
                <p className="text-xs text-gray-600 truncate">
                  {currentTrack?.artist}
                </p>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Heart className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            {/* Player Controls */}
            <div className="flex items-center space-x-4 max-sm:flex-1 max-sm:justify-center">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-md transition-colors ${
                  isShuffled
                    ? "text-Snowlight-pink bg-pink-50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={handlePrevious}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 bg-Snowlight-pink text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <button
                onClick={handleNext}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <SkipForward className="w-5 h-5" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-md transition-colors ${
                  repeatMode !== "off"
                    ? "text-Snowlight-pink bg-pink-50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>
            {/* Time and Volume */}
            <div className="flex items-center space-x-4 flex-1 justify-end max-sm:justify-between">
              <span className="text-xs text-gray-600 tabular-nums">
                {formatTime(currentTime)} /{" "}
                {formatTime(currentTrack?.duration || 0)}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <div
                  ref={volumeRef2}
                  className="w-24 h-1 bg-gray-200 rounded-full cursor-pointer"
                  onClick={handleVolumeClick}
                  role="slider"
                  tabIndex={0}
                  aria-valuenow={volume}
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-label="Volume"
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") {
                      setVolume(Math.max(0, volume - 0.05));
                    } else if (e.key === "ArrowRight") {
                      setVolume(Math.min(1, volume + 0.05));
                    } else if (e.key === "Enter" || e.key === " ") {
                      handleVolumeClick(
                        e as unknown as React.MouseEvent<HTMLDivElement>
                      );
                    }
                  }}
                >
                  <div
                    className="h-full bg-Snowlight-pink rounded-full"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className={`p-2 rounded-md transition-colors ${
                    showPlaylist
                      ? "text-Snowlight-pink bg-pink-50"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => closeAudioPlayer()}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Sidebar */}
      {showPlaylist && (
        <div className="fixed right-0 bottom-20 top-0 w-80 bg-slate-200 border-l border-gray-200 shadow-lg z-[12001] overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">재생목록</h3>
              <button
                onClick={() => setShowPlaylist(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">{playlist?.length}곡</p>
          </div>

          <div className="p-2">
            {playlist?.map((track, index) => (
              <div
                key={track.id}
                className={`flex items-center space-x-3 p-2 group rounded-md cursor-pointer hover:bg-gray-50 ${
                  index === currentIndex
                    ? "bg-pink-50 border border-pink-200"
                    : ""
                }`}
                role="button"
                tabIndex={0}
                aria-label={`Play ${track.title} by ${track.artist}`}
                onClick={() => handlePlaylistTrack(track)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handlePlaylistTrack(track);
                  }
                }}
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={() => handlePlaylistTrack(track)}
                aria-pressed={index === currentIndex && isPlaying}
              >
                <div className="w-6 text-center">
                  {index === currentIndex && isPlaying ? (
                    <div className="w-4 h-4 bg-Snowlight-pink rounded-full animate-pulse" />
                  ) : (
                    <span className="text-sm text-gray-500">{index + 1}</span>
                  )}
                </div>
                <img
                  src={track.coverImage || "https://placehold.co/600x400"}
                  alt={track.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-medium truncate ${
                      index === currentIndex
                        ? "text-Snowlight-pink"
                        : "text-gray-900"
                    }`}
                  >
                    {track.title}
                  </h4>
                  <p className="text-xs text-gray-600 truncate">
                    {track.artist}
                  </p>
                </div>
                <span className="text-xs text-gray-500 tabular-nums">
                  {formatDuration(track.duration ?? 0)}
                </span>
                <button
                  className="ml-2 p-1 rounded hover:bg-gray-200 text-gray-400 group-hover:text-red-500 group-hover:block hidden"
                  title="Remove from playlist"
                  onClick={async () => {
                    handleRemoveFromPlaylist(track);
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Player Modal */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 bg-black/50 !z-[12002]"
            aria-label="Close expanded audio player"
            tabIndex={0}
            onClick={() => setIsExpanded(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
                setIsExpanded(false);
              }
            }}
            onMouseDown={(e) => {
              // Prevent focus loss on click
              e.preventDefault();
            }}
            onTouchStart={() => setIsExpanded(false)}
            style={{ cursor: "pointer" }}
          />

          {/* Expanded Player Modal with Playlist Sidebar */}
          <div
            style={{
              backgroundImage: currentTrack?.coverImage
                ? `url(${currentTrack.coverImage})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
            className="fixed inset-4 backdrop-blur-2xl bac md:inset-8 bg-opacity-90 bg-blend-overlay bg-white rounded-lg shadow-2xl z-[12003] flex flex-row overflow-y-auto"
          >
            {/* Playlist Sidebar (left column, only if open) */}
            {showPlaylist && (
              <div className="w-80 h-full bg-white border-r border-gray-200 shadow-lg overflow-y-auto flex-shrink-0 max-sm:fixed max-sm:top-0 max-sm:left-0">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">재생목록</h3>
                    <button
                      onClick={() => setShowPlaylist(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {playlist?.length}곡
                  </p>
                </div>
                <div className="p-2">
                  {playlist?.map((track, index) => (
                    <div
                      key={track.id}
                      className={`flex items-center space-x-3 group p-2 rounded-md cursor-pointer hover:bg-gray-50 ${
                        index === currentIndex
                          ? "bg-pink-50 border border-pink-200"
                          : ""
                      }`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Play ${track.title} by ${track.artist}`}
                      onClick={() => handlePlaylistTrack(track)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handlePlaylistTrack(track);
                        }
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={() => handlePlaylistTrack(track)}
                      aria-pressed={index === currentIndex && isPlaying}
                    >
                      <div className="w-6 text-center">
                        {index === currentIndex && isPlaying ? (
                          <div className="w-4 h-4 bg-Snowlight-pink rounded-full animate-pulse" />
                        ) : (
                          <span className="text-sm text-gray-500">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <img
                        src={track.coverImage || "https://placehold.co/600x400"}
                        alt={track.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm font-medium truncate ${
                            index === currentIndex
                              ? "text-Snowlight-pink"
                              : "text-gray-900"
                          }`}
                        >
                          {track.title}
                        </h4>
                        <p className="text-xs text-gray-600 truncate">
                          {track.artist}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 tabular-nums">
                        {formatDuration(track.duration ?? 0)}
                      </span>
                      <button
                        className="ml-2 p-1 rounded hover:bg-gray-200 text-gray-400 group-hover:text-red-500 group-hover:block hidden"
                        title="Remove from playlist"
                        onClick={async () => {
                          handleRemoveFromPlaylist(track);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Main Player Content (right column) */}
            <div className="flex-1 flex flex-col justify-center p-4">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">재생 중</h2>
                <button
                  onClick={() => {
                    setIsExpanded(false);
                  }}
                  className="p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
              {/* Main Player Section */}
              <div className="flex-1 flex flex-col justify-center">
                {/* Album Art */}
                <div className="text-center mb-8">
                  <img
                    src={
                      currentTrack?.coverImage || "https://placehold.co/600x400"
                    }
                    alt={currentTrack?.title}
                    className="w-64 h-64 mx-auto rounded-lg shadow-lg object-cover"
                  />
                </div>
                {/* Track Info */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {typeof currentTrack?.title === "string"
                      ? currentTrack.title
                      : ""}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">
                    {typeof currentTrack?.artist === "string"
                      ? currentTrack.artist
                      : ""}
                  </p>
                  <p className="text-sm text-gray-500">
                    {typeof currentTrack?.album === "string"
                      ? currentTrack.album
                      : typeof currentTrack?.album === "object" &&
                        "title" in currentTrack.album &&
                        typeof currentTrack.album.title === "string"
                      ? currentTrack.album.title
                      : ""}
                  </p>
                </div>
                {/* Progress */}
                <div className="mb-8">
                  <div
                    ref={progressRef}
                    className="w-full h-2 bg-gray-200 rounded-full cursor-pointer mb-2"
                    onClick={handleProgressClick}
                    role="slider"
                    tabIndex={0}
                    aria-valuenow={currentTime}
                    aria-valuemin={0}
                    aria-valuemax={currentTrack?.duration || 0}
                    aria-label="Audio progress"
                    onKeyDown={(e) => {
                      if (e.key === "ArrowLeft") {
                        seekTo(Math.max(0, currentTime - 5));
                      } else if (e.key === "ArrowRight") {
                        seekTo(
                          Math.min(currentTrack?.duration || 0, currentTime + 5)
                        );
                      }
                    }}
                  >
                    <div
                      className="h-full bg-Snowlight-pink rounded-full transition-all duration-100"
                      style={{
                        width:
                          (currentTrack?.duration ?? 0) > 0
                            ? `${
                                (currentTime / (currentTrack?.duration ?? 0)) *
                                100
                              }%`
                            : "0%",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(currentTrack?.duration ?? 0)}</span>
                  </div>
                </div>
                {/* Controls */}
                <div className="flex items-center justify-center space-x-6 mb-8">
                  <button
                    onClick={toggleShuffle}
                    className={`p-2 rounded-md transition-colors ${
                      isShuffled
                        ? "text-Snowlight-pink bg-pink-50"
                        : "text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50"
                    }`}
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handlePrevious}
                    className="p-3 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors"
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 bg-Snowlight-pink text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-3 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                  <button
                    onClick={toggleRepeat}
                    className={`p-2 rounded-md transition-colors ${
                      repeatMode !== "off"
                        ? "text-Snowlight-pink bg-pink-50"
                        : "text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50"
                    }`}
                  >
                    <Repeat className="w-5 h-5" />
                  </button>
                </div>
                {/* Volume and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                    <div
                      ref={volumeRef}
                      className="w-24 h-1 bg-gray-200 rounded-full cursor-pointer"
                      onClick={handleVolumeClick}
                      role="slider"
                      tabIndex={0}
                      aria-valuenow={volume}
                      aria-valuemin={0}
                      aria-valuemax={1}
                      aria-label="Volume"
                      onKeyDown={(e) => {
                        if (e.key === "ArrowLeft") {
                          setVolume(Math.max(0, volume - 0.05));
                        } else if (e.key === "ArrowRight") {
                          setVolume(Math.min(1, volume + 0.05));
                        } else if (e.key === "Enter" || e.key === " ") {
                          handleVolumeClick(
                            e as unknown as React.MouseEvent<HTMLDivElement>
                          );
                        }
                      }}
                    >
                      <div
                        className="h-full bg-Snowlight-pink rounded-full"
                        style={{ width: `${volume * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowPlaylist(!showPlaylist)}
                      className={`p-2 rounded-md transition-colors ${
                        showPlaylist
                          ? "text-Snowlight-pink bg-pink-50"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
}
