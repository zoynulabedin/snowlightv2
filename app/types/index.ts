export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl: string
  audioUrl?: string
  videoUrl?: string
  genre: string[]
  releaseDate: string
  isTitle?: boolean
}

export interface Album {
  id: string
  title: string
  artist: string
  coverUrl: string
  releaseDate: string
  type: 'single' | 'album' | 'ep' | 'ost' | 'compilation' | 'live'
  genre: string[]
  tracks: Track[]
  description?: string
}

export interface Artist {
  id: string
  name: string
  imageUrl: string
  genre: string[]
  albums: Album[]
}

export interface Playlist {
  id: string
  title: string
  description?: string
  coverUrl: string
  tracks: Track[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  playlists: Playlist[]
  favoriteAlbums: Album[]
  favoriteTracks: Track[]
}

export interface ChartEntry {
  rank: number
  track: Track
  change: 'up' | 'down' | 'same' | 'new'
  changeAmount?: number
}

