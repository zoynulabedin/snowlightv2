import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  RotateCcw,
  X,
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  isVisible: boolean;
  onClose: () => void;
  autoPlay?: boolean;
}

export default function VideoPlayer({
  videoUrl,
  title,
  isVisible,
  onClose,
  autoPlay = false,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let mounted = true;
    let loadingTimeout: NodeJS.Timeout;

    const loadVideo = async () => {
      try {
        // Create promises for metadata loading
        const loadPromise = new Promise((resolve) => {
          const handleLoad = () => {
            if (video.duration && !isNaN(video.duration)) {
              setDuration(video.duration);
              setIsLoading(false);
              resolve(true);
            }
          };
          video.addEventListener("loadedmetadata", handleLoad);
          video.addEventListener("loadeddata", handleLoad);
          video.addEventListener("durationchange", handleLoad);
          return () => {
            video.removeEventListener("loadedmetadata", handleLoad);
            video.removeEventListener("loadeddata", handleLoad);
            video.removeEventListener("durationchange", handleLoad);
          };
        });

        // Race between loading and timeout
        await Promise.race([
          loadPromise,
          new Promise((resolve) => {
            loadingTimeout = setTimeout(resolve, 5000);
          }),
        ]);

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading video:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const handleTimeUpdate = () => {
      if (!mounted) return;
      setCurrentTime(video.currentTime);
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    loadVideo();

    return () => {
      mounted = false;
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    setHoverPosition(position * duration);
    setIsHovering(true);
  };
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const position = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width)
    );
    const newTime = position * duration;

    try {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);

      // Force play if was playing
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          setIsLoading(false);
        });
      }
    } catch (error) {
      console.error("Error seeking:", error);
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changePlaybackRate = (rate: number) => {
    if (!videoRef.current) return;

    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const resetVideo = () => {
    if (!videoRef.current) return;

    videoRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Only render video if videoUrl is a non-empty string
  if (!isVisible || !isClient) return null;

  const isValidVideoUrl =
    typeof videoUrl === "string" && videoUrl.trim() !== "";

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999999] flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all hover:scale-110 active:scale-95"
        aria-label="Close video"
      >
        <X className="w-5 h-5" />
      </button>
      <div
        ref={containerRef}
        className="relative w-[98%] xs:w-[98%] sm:w-[98%] md:w-[95%] lg:w-[95%] xl:w-[90%] 2xl:w-[85%] 3xl:w-[80%] ultra:w-[75%] h-[50vh] xs:h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh] xl:h-[80vh] max-w-[95vw] bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Video Element */}
        {isValidVideoUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain bg-black/90"
            onClick={togglePlay}
            src={videoUrl}
            autoPlay={autoPlay}
            preload="metadata"
            crossOrigin="anonymous"
            controls={false}
            playsInline
            role="button"
            tabIndex={0}
            aria-label="Toggle play/pause"
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              if (video.duration && !isNaN(video.duration)) {
                setDuration(video.duration);
                setIsLoading(false);
              }
            }}
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              setCurrentTime(video.currentTime);
              if (video.duration && !isNaN(video.duration)) {
                setDuration(video.duration);
                setIsLoading(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                togglePlay();
              }
            }}
          >
            <track
              kind="captions"
              srcLang="en"
              label="English captions"
              src=""
              default
            />
          </video>
        ) : (
          <div className="flex items-center justify-center h-full text-white/90 text-lg bg-black/90">
            지원되지 않는 비디오 형식이거나 소스가 없습니다.
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-white/10 border-t-white/90 rounded-full animate-spin" />
          </div>
        )}

        {/* Controls Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 transition-all duration-300 ${
            showControls ? "opacity-100 backdrop-blur-[2px]" : "opacity-0"
          } group`}
        >
          {/* Title */}
          <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <h2 className="text-white text-lg font-medium truncate px-2">
              {title}
            </h2>
          </div>

          {/* Center Play Button */}
          {!isPlaying && !isLoading && isValidVideoUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="w-20 h-20 bg-Snowlight-pink/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-Snowlight-pink/30 transition-all hover:scale-110 active:scale-95 ring-1 ring-white/20"
                aria-label="Play video"
              >
                <Play className="w-8 h-8 ml-1" />
              </button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent">
            <div className="px-4 pb-4 pt-20">
              {/* Progress Bar */}
              <div className="relative mb-4 px-1">
                {" "}
                <div
                  ref={progressRef}
                  className="relative w-full h-6 group cursor-pointer"
                  onClick={handleProgressClick}
                  onMouseDown={handleProgressClick}
                  onMouseMove={handleProgressHover}
                  onMouseLeave={() => setIsHovering(false)}
                  role="slider"
                  tabIndex={0}
                  aria-label="Video progress"
                  aria-valuemin={0}
                  aria-valuemax={duration}
                  aria-valuenow={currentTime}
                  onKeyDown={(e) => {
                    switch (e.key) {
                      case "ArrowLeft":
                        e.preventDefault();
                        skipTime(-5);
                        break;
                      case "ArrowRight":
                        e.preventDefault();
                        skipTime(5);
                        break;
                    }
                  }}
                >
                  {/* Time Preview */}
                  {isHovering && (
                    <div
                      className="absolute bottom-full mb-2 transform -translate-x-1/2 bg-black/90 text-white px-2 py-1 rounded text-xs z-50 backdrop-blur-md ring-1 ring-white/10"
                      style={{ left: `${(hoverPosition / duration) * 100}%` }}
                    >
                      {formatTime(hoverPosition)}
                    </div>
                  )}
                  {/* Main Timeline Bar */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-white/20 h-1 group-hover:h-1.5 transition-all duration-200 rounded-full">
                    <div
                      className="h-full bg-Snowlight-pink rounded-full relative transition-all duration-200"
                      style={{
                        width: `${
                          duration ? (currentTime / duration) * 100 : 0
                        }%`,
                      }}
                    >
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-Snowlight-pink rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg shadow-black/50 ring-2 ring-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 bg-white/10 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => skipTime(-10)}
                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-all hover:scale-105 active:scale-95"
                    aria-label="Rewind 10 seconds"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => skipTime(10)}
                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-all hover:scale-105 active:scale-95"
                    aria-label="Forward 10 seconds"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  <button
                    onClick={resetVideo}
                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-all hover:scale-105 active:scale-95"
                    aria-label="Reset video"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <div className="flex items-center space-x-2 group/volume">
                    <button
                      onClick={toggleMute}
                      className="p-2 text-white hover:bg-white/10 rounded-lg transition-all hover:scale-105 active:scale-95"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-0 group-hover/volume:w-20 transition-all duration-200 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-Snowlight-pink hover:accent-Snowlight-pink"
                      aria-label="Volume"
                    />
                  </div>

                  <span className="text-white/90 text-sm font-medium tabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Settings Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 text-white hover:bg-white/10 rounded-lg transition-all hover:scale-105 active:scale-95"
                      aria-label="Settings"
                    >
                      <Settings className="w-5 h-5" />
                    </button>

                    {showSettings && (
                      <div className="absolute bottom-12 right-0 bg-black/95 backdrop-blur-md rounded-lg p-3 min-w-36 shadow-xl ring-1 ring-white/10">
                        <div className="text-white/90 text-sm font-medium mb-2">
                          재생 속도
                        </div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => changePlaybackRate(rate)}
                            className={`block w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                              playbackRate === rate
                                ? "bg-Snowlight-pink/20 text-Snowlight-pink"
                                : "text-white/90 hover:bg-white/10"
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-all hover:scale-105 active:scale-95"
                    aria-label={
                      isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                    }
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5" />
                    ) : (
                      <Maximize className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
