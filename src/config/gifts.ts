import type { FrameStyle } from './memories'

export interface Gift {
  id: number
  title: string
  emoji: string
  message: string
  caption?: string
  photoPath?: string
  audioPath?: string
  frame: FrameStyle
  fc: string
}

const g = (id: number, emoji: string, title: string, message: string): Gift => ({ id, emoji, title, message, frame: 'sticker', fc: '#ffffff' })

export const gifts: Gift[] = [
  g(1, '💌', 'A Heartfelt Compliment', 'You make ordinary days feel like something special.'),
  g(2, '📸', 'A Favorite Memory', '[Placeholder] Describe your favorite memory together.'),
  g(3, '🪶', 'A Romantic Poem', '[Placeholder] Paste a poem you wrote for her.'),
  g(4, '🎨', 'A Couple Illustration', '[Placeholder] Add an illustration of the two of you.'),
  g(5, '🎙️', 'A Secret Voice Message', '[Placeholder] Add a voice note in the Studio.'),
  g(6, '🤗', 'A Digital Hug', 'Sending you the biggest hug in the universe.'),
  g(7, '🖼️', 'A Favorite Photograph', '[Placeholder] Add a favorite photo in the Studio.'),
  g(8, '🎶', 'A Playlist of Songs', '[Placeholder] List songs you picked for her.'),
  g(9, '💐', 'A Virtual Bouquet', 'A bouquet that never wilts, just for you.'),
  g(10, '🤍', 'A Special Promise', '[Placeholder] Write a promise you mean.'),
  g(11, '🌙', 'A Future Date Night', '[Placeholder] Describe a date night you are planning.'),
  g(12, '🎁', 'The Ultimate Surprise', '[Placeholder] Your biggest surprise goes here.'),
]
