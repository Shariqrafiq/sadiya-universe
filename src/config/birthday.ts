// Edit this file to personalise the site. No secrets here.
export const birthday = {
  name: 'Sadiya',
  title: 'A Little Universe Made for Sadiya',
  mainMessage: 'Every little moment with you is my favorite memory.',
  // Birthday: November 14, 2026 (local midnight)
  date: new Date(2026, 10, 14, 0, 0, 0),
  // Set to an ISO date (e.g. '2024-02-14T00:00:00') to enable the Love Counter. Left empty on purpose.
  relationshipStart: '' as string,
  secretKeySequence: ['l', 'o', 'v', 'e'],
  secretNote: 'You found the secret key sequence. Edit this note in config/birthday.ts.',
  moonMessage: 'The moon is keeping a secret: you are wonderful.',
  heartCompliment: 'Your smile could light up a whole galaxy.',
  dateIdeas: [
    'A sunset walk',
    'A cozy movie night',
    'A surprise picnic',
    'A stargazing date',
    'A handwritten letter exchange',
  ],
  // Path inside the private "private-media" bucket. Leave empty until the file is uploaded.
  voiceMessage: {
    caption: 'I wish I could be beside you right now, holding your hand and celebrating your beautiful smile.',
    mediaPath: '',
    kind: 'audio' as 'audio' | 'video',
    posterPath: '',
  },
}
