import { formatTime, getSongById, songs } from './Data.js';

export default class Player {
  constructor() {
    this.audio = document.getElementById('audio');
    this.currentSongId = Number(localStorage.getItem('wave-last-track') || 1);
    this.playlist = [...songs];
    this.currentIndex = this.playlist.findIndex(song => song.id === this.currentSongId);
    if (this.currentIndex < 0) this.currentIndex = 0;
    this.isPlaying = false;
  }

  bindEvents() {
    if (!this.audio) {
      this.audio = document.getElementById('audio');
    }
    if (!this.audio) return;

    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended', () => this.next());
    document.querySelector('[data-play-toggle]')?.addEventListener('click', () => this.toggle());
    document.querySelector('[data-next]')?.addEventListener('click', () => this.next());
    document.querySelector('[data-prev]')?.addEventListener('click', () => this.previous());
    document.querySelector('[data-progress]')?.addEventListener('click', (event) => this.seek(event));
    document.querySelector('[data-volume]')?.addEventListener('input', (event) => this.setVolume(event.target.value));
  }

  async loadSong(songId) {
    const song = getSongById(songId);
    if (!song) return;
    this.currentSongId = song.id;
    this.audio.src = song.audio;
    this.audio.load();
    this.renderSong(song);
    localStorage.setItem('wave-last-track', String(song.id));
    await this.audio.play().catch(() => {
      this.isPlaying = false;
      this.renderPlaybackState();
    });
    this.isPlaying = true;
    this.renderPlaybackState();
  }

  play() {
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.renderPlaybackState();
    }).catch(() => {
      this.isPlaying = false;
      this.renderPlaybackState();
    });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.renderPlaybackState();
  }

  toggle() {
    if (this.isPlaying) this.pause(); else this.play();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.loadSong(this.playlist[this.currentIndex].id);
  }

  previous() {
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadSong(this.playlist[this.currentIndex].id);
  }

  seek(event) {
    const progressTrack = event.currentTarget;
    const rect = progressTrack.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    this.audio.currentTime = ratio * this.audio.duration;
    this.updateProgress();
  }

  setVolume(value) {
    this.audio.volume = Number(value);
  }

  updateProgress() {
    const percent = this.audio.duration ? (this.audio.currentTime / this.audio.duration) * 100 : 0;
    const fill = document.querySelector('[data-progress-fill]');
    const currentTime = document.querySelector('[data-current-time]');
    const totalTime = document.querySelector('[data-total-time]');
    if (fill) fill.style.width = `${percent}%`;
    if (currentTime) currentTime.textContent = formatTime(this.audio.currentTime || 0);
    if (totalTime) totalTime.textContent = formatTime(this.audio.duration || 0);
  }

  renderSong(song) {
    const cover = document.querySelector('[data-player-cover]');
    const title = document.querySelector('[data-player-title]');
    const artist = document.querySelector('[data-player-artist]');
    if (cover) cover.src = song.cover;
    if (title) title.textContent = song.title;
    if (artist) artist.textContent = song.artist;
    document.querySelectorAll('[data-song-id]').forEach(el => {
      el.classList.toggle('is-active', Number(el.dataset.songId) === song.id);
    });
  }

  renderPlaybackState() {
    const toggle = document.querySelector('[data-play-toggle]');
    if (toggle) {
      const icon = toggle.querySelector('i');
      if (icon) icon.className = this.isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }
  }
}
