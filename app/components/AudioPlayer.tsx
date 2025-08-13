import { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, Heart, Download, MoreHorizontal, 
  Maximize2, List, X
} from 'lucide-react';
import { usePlayer, Track } from '~/contexts/PlayerContext';

export default function AudioPlayer() {
  const { 
    currentTrack, 
    playlist, 
    isAudioPlayerVisible, 
    closeAudioPlayer,
    playTrack
  } = usePlayer();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isExpanded, setIsExpanded] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      
      // Find current track index in playlist
      const index = playlist.findIndex(track => track.id === currentTrack.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [currentTrack, playlist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === 'all' || currentIndex < playlist.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', () => setIsPlaying(true));
      audio.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, [repeatMode, currentIndex, playlist.length]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleNext = () => {
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
  };

  const handlePrevious = () => {
    if (playlist.length === 0) return;

    if (currentTime > 3) {
      // If more than 3 seconds played, restart current track
      seekTo(0);
    } else {
      // Go to previous track
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
      const prevTrack = playlist[prevIndex];
      if (prevTrack) {
        playTrack(prevTrack, playlist);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      seekTo(newTime);
    }
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeRef.current) {
      const rect = volumeRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newVolume = Math.max(0, Math.min(1, clickX / rect.width));
      setVolume(newVolume);
      if (newVolume > 0) {
        setIsMuted(false);
      }
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
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
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const handlePlaylistTrack = (track: Track) => {
    playTrack(track, playlist);
  };

  if (!isAudioPlayerVisible || !currentTrack) return null;

  return (
    <>
      <audio ref={audioRef} />
      
      {/* Bottom Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        {/* Progress Bar */}
        <div 
          ref={progressRef}
          className="w-full h-1 bg-gray-200 cursor-pointer hover:h-2 transition-all duration-200"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-bugs-pink transition-all duration-100"
            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Track Info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-gray-600 truncate">
                  {currentTrack.artist}
                </p>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Heart className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Player Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-md transition-colors ${
                  isShuffled ? 'text-bugs-pink bg-pink-50' : 'text-gray-600 hover:bg-gray-100'
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
                className="w-10 h-10 bg-bugs-pink text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
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
                  repeatMode !== 'off' ? 'text-bugs-pink bg-pink-50' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Time and Volume */}
            <div className="flex items-center space-x-4 flex-1 justify-end">
              <span className="text-xs text-gray-600 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className="p-1 hover:bg-gray-100 rounded">
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <div 
                  ref={volumeRef}
                  className="w-20 h-1 bg-gray-200 rounded-full cursor-pointer"
                  onClick={handleVolumeClick}
                >
                  <div 
                    className="h-full bg-bugs-pink rounded-full"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className={`p-2 rounded-md transition-colors ${
                    showPlaylist ? 'text-bugs-pink bg-pink-50' : 'text-gray-600 hover:bg-gray-100'
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
                  onClick={closeAudioPlayer}
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
        <div className="fixed right-0 bottom-20 top-0 w-80 bg-white border-l border-gray-200 shadow-lg z-40 overflow-y-auto">
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
            <p className="text-sm text-gray-600 mt-1">{playlist.length}곡</p>
          </div>
          
          <div className="p-2">
            {playlist.map((track, index) => (
              <div
                key={track.id}
                className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer hover:bg-gray-50 ${
                  index === currentIndex ? 'bg-pink-50 border border-pink-200' : ''
                }`}
                onClick={() => handlePlaylistTrack(track)}
              >
                <div className="w-6 text-center">
                  {index === currentIndex && isPlaying ? (
                    <div className="w-4 h-4 bg-bugs-pink rounded-full animate-pulse" />
                  ) : (
                    <span className="text-sm text-gray-500">{index + 1}</span>
                  )}
                </div>
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium truncate ${
                    index === currentIndex ? 'text-bugs-pink' : 'text-gray-900'
                  }`}>
                    {track.title}
                  </h4>
                  <p className="text-xs text-gray-600 truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-gray-500 tabular-nums">
                  {formatDuration(track.duration)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Player Modal */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Expanded Player */}
          <div className="fixed inset-4 md:inset-8 bg-white rounded-lg shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">재생 중</h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 text-gray-600 hover:text-bugs-pink hover:bg-pink-50 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Player Content */}
            <div className="flex-1 flex flex-col justify-center p-8">
              {/* Album Art */}
              <div className="text-center mb-8">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-64 h-64 mx-auto rounded-lg shadow-lg object-cover"
                />
              </div>

              {/* Track Info */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentTrack.title}</h1>
                <p className="text-lg text-gray-600 mb-4">{currentTrack.artist}</p>
                <p className="text-sm text-gray-500">{currentTrack.album}</p>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div 
                  ref={progressRef}
                  className="w-full h-2 bg-gray-200 rounded-full cursor-pointer mb-2"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="h-full bg-bugs-pink rounded-full transition-all duration-100"
                    style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-6 mb-8">
                <button
                  onClick={toggleShuffle}
                  className={`p-2 rounded-md transition-colors ${
                    isShuffled ? 'text-bugs-pink bg-pink-50' : 'text-gray-600 hover:text-bugs-pink hover:bg-pink-50'
                  }`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handlePrevious}
                  className="p-3 text-gray-600 hover:text-bugs-pink hover:bg-pink-50 rounded-md transition-colors"
                >
                  <SkipBack className="w-6 h-6" />
                </button>
                
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-bugs-pink text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
                
                <button
                  onClick={handleNext}
                  className="p-3 text-gray-600 hover:text-bugs-pink hover:bg-pink-50 rounded-md transition-colors"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
                
                <button
                  onClick={toggleRepeat}
                  className={`p-2 rounded-md transition-colors ${
                    repeatMode !== 'off' ? 'text-bugs-pink bg-pink-50' : 'text-gray-600 hover:text-bugs-pink hover:bg-pink-50'
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
                    className="p-2 text-gray-600 hover:text-bugs-pink hover:bg-pink-50 rounded-md transition-colors"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <div 
                    ref={volumeRef}
                    className="w-24 h-1 bg-gray-200 rounded-full cursor-pointer"
                    onClick={handleVolumeClick}
                  >
                    <div 
                      className="h-full bg-bugs-pink rounded-full"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-bugs-pink hover:bg-pink-50 rounded-md transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-bugs-pink hover:bg-pink-50 rounded-md transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-bugs-pink hover:bg-pink-50 rounded-md transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

