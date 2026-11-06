export type FrameStyle = 'polaroid' | 'gold' | 'heart' | 'round' | 'film' | 'tape' | 'blob' | 'sticker' | 'plain'
export const FRAME_OPTIONS: [FrameStyle, string][] = [
  ['polaroid', 'Polaroid'], ['gold', 'Gold'], ['heart', 'Heart'], ['round', 'Round'], ['film', 'Film strip'],
  ['tape', 'Taped'], ['blob', 'Soft blob'], ['sticker', 'Sticker'], ['plain', 'Plain'],
]

export interface Memory {
  id: string
  title: string
  date: string
  description: string
  emoji: string
  photoPath?: string // path inside the private bucket
  frame: FrameStyle
  fc: string // frame colour
  audioPath?: string
  mapUrl?: string
}

// Starting content only. Real content is edited in the Studio and stored in Supabase.
export const memories: Memory[] = [
  { id: 'm1', title: 'The Day We First Met', date: '', emoji: '🌸', frame: 'polaroid', fc: '#ffffff', description: '[Placeholder] Write the real story of your first meeting here.' },
  { id: 'm2', title: 'My Favorite Smile', date: '', emoji: '😊', frame: 'gold', fc: '#ffffff', description: '[Placeholder] Describe the smile you love most.' },
  { id: 'm3', title: 'Our Little Adventures', date: '', emoji: '🗺️', frame: 'heart', fc: '#ffffff', description: '[Placeholder] Add a trip or outing you shared.' },
  { id: 'm4', title: 'The Moment I Knew', date: '', emoji: '💗', frame: 'tape', fc: '#ffffff', description: '[Placeholder] Say what you realised and when.' },
  { id: 'm5', title: 'Every Ordinary Day With You', date: '', emoji: '☕', frame: 'round', fc: '#ffffff', description: '[Placeholder] Celebrate the small everyday things.' },
]
