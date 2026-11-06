export interface Track {
  title: string
  artist: string
  src: string // royalty-free or your own file, placed in /public/audio
  art?: string
}

// Empty on purpose: add only music you have the rights to use.
export const tracks: Track[] = [
  // { title: 'Song name', artist: 'Artist', src: '/audio/song.mp3', art: '/audio/art.webp' },
]
