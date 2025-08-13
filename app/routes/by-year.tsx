import { useState } from 'react';
import { Calendar, Play, Heart, Download, MoreHorizontal, TrendingUp, Music } from 'lucide-react';
import { useLanguage } from '~/contexts/LanguageContext';

interface YearlyData {
  year: number;
  totalTracks: number;
  topGenres: string[];
  popularTracks: Track[];
  newArtists: number;
  totalListens: number;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  releaseDate: string;
  genre: string;
  plays: number;
}

export default function ByYearPage() {
  const { t } = useLanguage();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedGenre, setSelectedGenre] = useState('all');

  // Generate years from 2000 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

  // Mock data for different years
  const yearlyData: Record<number, YearlyData> = {
    2025: {
      year: 2025,
      totalTracks: 1247,
      topGenres: ['K-POP', 'Hip-Hop', 'Pop', 'R&B', 'Electronic'],
      newArtists: 89,
      totalListens: 15420000,
      popularTracks: [
        {
          id: '1',
          title: 'Golden',
          artist: 'HUNTR/X',
          album: 'KPop Demon Hunters (Soundtrack)',
          duration: 210,
          coverUrl: '/api/placeholder/300/300',
          audioUrl: '/audio/golden.mp3',
          releaseDate: '2025-08-08',
          genre: 'K-POP',
          plays: 2450000
        },
        {
          id: '2',
          title: 'Soda Pop',
          artist: 'Saja Boys',
          album: 'KPop Demon Hunters (Soundtrack)',
          duration: 195,
          coverUrl: '/api/placeholder/300/300',
          audioUrl: '/audio/soda-pop.mp3',
          releaseDate: '2025-08-07',
          genre: 'Pop',
          plays: 1890000
        },
        {
          id: '3',
          title: '뛰어(JUMP)',
          artist: 'BLACKPINK',
          album: '뛰어(JUMP)',
          duration: 205,
          coverUrl: '/api/placeholder/300/300',
          audioUrl: '/audio/jump.mp3',
          releaseDate: '2025-08-06',
          genre: 'K-POP',
          plays: 3120000
        },
        {
          id: '4',
          title: 'FAMOUS',
          artist: 'ALLDAY PROJECT',
          album: 'FAMOUS',
          duration: 180,
          coverUrl: '/api/placeholder/300/300',
          audioUrl: '/audio/famous.mp3',
          releaseDate: '2025-08-05',
          genre: 'Hip-Hop',
          plays: 1650000
        },
        {
          id: '5',
          title: '여름이었다',
          artist: 'H1-KEY (하이키)',
          album: 'H1-KEY 4th Mini Album [Lovestruck]',
          duration: 225,
          coverUrl: '/api/placeholder/300/300',
          audioUrl: '/audio/summer.mp3',
          releaseDate: '2025-08-04',
          genre: 'K-POP',
          plays: 1420000
        }
      ]
    },
    2024: {
      year: 2024,
      totalTracks: 2156,
      topGenres: ['K-POP', 'Pop', 'Hip-Hop', 'R&B', 'Rock'],
      newArtists: 124,
      totalListens: 28750000,
      popularTracks: [
        {
          id: '6',
          title: 'Supernova',
          artist: 'aespa',
          album: 'Armageddon',
          duration: 195,
          coverUrl: '/api/placeholder/300/300',
          audioUrl: '/audio/supernova.mp3',
          releaseDate: '2024-05-13',
          genre: 'K-POP',
          plays: 4250000
        },
        {
          id: '7',
          title: 'How Sweet',
          artist: 'NewJeans',
          album: 'How Sweet',
          duration: 210,
          coverUrl: '/api/placeholder/300/300',
          audioUrl: '/audio/how-sweet.mp3',
          releaseDate: '2024-05-24',
          genre: 'K-POP',
          plays: 3890000
        }
      ]
    },
    2023: {
      year: 2023,
      totalTracks: 1987,
      topGenres: ['K-POP', 'Hip-Hop', 'Pop', 'Electronic', 'R&B'],
      newArtists: 156,
      totalListens: 32100000,
      popularTracks: [
        {
          id: '8',
          title: 'Flower',
          artist: 'JISOO',
          album: 'ME',
          duration: 190,
          coverUrl: '/api/placeholder/300/300',
          audioUrl: '/audio/flower.mp3',
          releaseDate: '2023-03-31',
          genre: 'K-POP',
          plays: 5120000
        }
      ]
    }
  };

  const currentYearData = yearlyData[selectedYear] || yearlyData[2025];
  
  const genres = ['all', ...currentYearData.topGenres.map(g => g.toLowerCase())];
  
  const filteredTracks = selectedGenre === 'all' 
    ? currentYearData.popularTracks 
    : currentYearData.popularTracks.filter(track => 
        track.genre.toLowerCase() === selectedGenre
      );

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('byYear.title', '연도별 음악')}
          </h1>
          <p className="text-gray-600">
            {t('byYear.description', '연도별로 인기 있었던 음악들을 만나보세요')}
          </p>
        </div>

        {/* Year Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Calendar className="w-5 h-5 text-bugs-pink" />
              <h2 className="text-lg font-semibold text-gray-900">
                {t('byYear.selectYear', '연도 선택')}
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {years.slice(0, 10).map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedYear === year
                      ? 'bg-bugs-pink text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Year Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t('byYear.stats.totalTracks', '총 트랙 수')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(currentYearData.totalTracks)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t('byYear.stats.totalListens', '총 재생 수')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(currentYearData.totalListens)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t('byYear.stats.newArtists', '신인 아티스트')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentYearData.newArtists}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t('byYear.stats.topGenres', '인기 장르')}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {currentYearData.topGenres[0]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Genre Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('byYear.filterByGenre', '장르별 필터')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedGenre === genre
                    ? 'bg-bugs-pink text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {genre === 'all' ? t('byYear.allGenres', '전체') : genre.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Tracks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              {selectedYear}년 {selectedGenre === 'all' ? t('byYear.popularTracks', '인기 트랙') : `${selectedGenre.toUpperCase()} ${t('byYear.tracks', '트랙')}`}
            </h3>
            <p className="text-gray-600 mt-1">
              {filteredTracks.length}곡의 트랙
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredTracks.map((track, index) => (
              <div key={track.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="w-8 text-center">
                    <span className="text-lg font-bold text-gray-900">{index + 1}</span>
                  </div>

                  {/* Album Cover */}
                  <div className="relative">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <button className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded-md flex items-center justify-center transition-all group">
                      <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                      {track.title}
                    </h4>
                    <p className="text-gray-600 truncate">{track.artist}</p>
                    <p className="text-sm text-gray-500 truncate">{track.album}</p>
                  </div>

                  {/* Genre */}
                  <div className="hidden md:block">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {track.genre}
                    </span>
                  </div>

                  {/* Release Date */}
                  <div className="hidden lg:block text-sm text-gray-500">
                    {formatDate(track.releaseDate)}
                  </div>

                  {/* Plays */}
                  <div className="hidden lg:block text-sm text-gray-500">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {formatNumber(track.plays)}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="text-sm text-gray-500 tabular-nums">
                    {formatDuration(track.duration)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-bugs-pink hover:bg-pink-50 rounded-md transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-bugs-pink hover:bg-pink-50 rounded-md transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-bugs-pink hover:bg-pink-50 rounded-md transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="p-6 border-t border-gray-200 text-center">
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              {t('byYear.loadMore', '더 많은 트랙 보기')}
            </button>
          </div>
        </div>

        {/* Top Genres of the Year */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {selectedYear}년 {t('byYear.topGenres', '인기 장르')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {currentYearData.topGenres.map((genre, index) => (
              <div key={genre} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-bugs-pink mb-1">#{index + 1}</div>
                <div className="text-sm font-medium text-gray-900">{genre}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

