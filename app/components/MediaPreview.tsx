import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

interface MediaPreviewProps {
  url: string;
  type: 'audio' | 'video';
  title?: string;
  artist?: string;
  className?: string;
}

export default function MediaPreview({ url, type, title, artist, className = '' }: MediaPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (mediaRef.current) {
      mediaRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const resetMedia = () => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      mediaRef.current.pause();
    }
  };

  if (type === 'audio') {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
        
        <div className="flex items-center space-x-4">
          {/* Album Art Placeholder */}
          <div className="w-16 h-16 bg-gradient-to-br from-bugs-pink to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Play className="w-6 h-6 text-white" />
          </div>
          
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {title || 'Untitled Track'}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {artist || 'Unknown Artist'}
            </p>
            
            {/* Progress Bar */}
            <div className="mt-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={resetMedia}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={togglePlay}
              className="p-2 bg-bugs-pink text-white rounded-full hover:bg-pink-600 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            
            <button
              onClick={toggleMute}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="relative">
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-48 object-cover"
          poster=""
        />
        
        {/* Video Overlay Controls */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="p-4 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200 transform hover:scale-110"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8" />
            )}
          </button>
        </div>
        
        {/* Video Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <h3 className="font-medium text-white truncate">
            {title || 'Untitled Video'}
          </h3>
          <p className="text-sm text-gray-300 truncate">
            {artist || 'Unknown Creator'}
          </p>
        </div>
      </div>
      
      {/* Video Controls */}
      <div className="p-4">
        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={resetMedia}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={togglePlay}
              className="p-2 bg-bugs-pink text-white rounded-full hover:bg-pink-600 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            
            <button
              onClick={() => {
                if (mediaRef.current && 'requestFullscreen' in mediaRef.current) {
                  (mediaRef.current as any).requestFullscreen();
                }
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

