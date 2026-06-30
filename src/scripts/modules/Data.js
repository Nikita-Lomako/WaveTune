export const songs = [
  { id: 1, title: 'Neon Pulse', artist: 'Cipher 9', album: 'Signal Lost', cover: 'https://picsum.photos/seed/1/300/300', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 184 },
  { id: 2, title: 'After Midnight', artist: 'Vanta', album: 'Static Bloom', cover: 'https://picsum.photos/seed/2/300/300', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 217 },
  { id: 3, title: 'Blue Circuit', artist: 'Nova Drift', album: 'Circuit Theory', cover: 'https://picsum.photos/seed/3/300/300', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 201 },
  { id: 4, title: 'Chrome Rain', artist: 'Kairo', album: 'Glass Sky', cover: 'https://picsum.photos/seed/4/300/300', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 195 },
  { id: 5, title: 'Magenta Skyline', artist: 'Raze', album: 'Night Grid', cover: 'https://picsum.photos/seed/5/300/300', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration: 173 },
  { id: 6, title: 'Vector Dream', artist: 'Lumen', album: 'Overclock', cover: 'https://picsum.photos/seed/6/300/300', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', duration: 188 },
  { id: 7, title: 'Glitch Halo', artist: 'Sable', album: 'Neon Echo', cover: 'https://picsum.photos/seed/7/300/300', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', duration: 221 },
  { id: 8, title: 'Static Hearts', artist: 'Mira', album: 'Pulse Drive', cover: 'https://picsum.photos/seed/8/300/300', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', duration: 164 },
  { id: 9, title: 'Signal Fire', artist: 'Axiom', album: 'Burnline', cover: 'https://picsum.photos/seed/9/300/300', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', duration: 176 },
  { id: 10, title: 'Cutting Edge', artist: 'Pixel V', album: 'Future Code', cover: 'https://picsum.photos/seed/10/300/300', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', duration: 198 }
];

export function getSongById(id) {
  return songs.find(song => song.id === Number(id)) || null;
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
  return `${mins}:${secs}`;
}

export function sanitizeText(value) {
  return String(value ?? '').trim().replace(/<[^>]*>/g, '');
}
