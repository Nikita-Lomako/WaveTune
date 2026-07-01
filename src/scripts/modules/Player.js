import { formatTime, getSongById, songs } from './Data.js';

export default class Player {
  constructor() {
    this.audio = document.getElementById('audio');
    this.currentSongId = Number(localStorage.getItem('wave-last-track') || 1);
    this.playlist = [...songs];
    this.currentIndex = this.playlist.findIndex(song => song.id === this.currentSongId);
    if (this.currentIndex < 0) this.currentIndex = 0;
    this.isPlaying = localStorage.getItem('wave-is-playing') === '1';
    this.currentTime = Number(localStorage.getItem('wave-current-time') || 0);
  }

  bindEvents() {
    if (!this.audio) {
      this.audio = document.getElementById('audio');
    }
    if (!this.audio) return;

    this.volumeControl = document.querySelector('[data-volume]');
    if (this.volumeControl) {
      this.volumeControl.value = String(this.audio.volume || 0.8);
    }

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime || 0;
      this.persistQueue();
      this.updateProgress();
    });
    this.audio.addEventListener('loadedmetadata', () => {
      if (this.currentTime > 0) {
        this.audio.currentTime = this.currentTime;
      }
    });
    this.audio.addEventListener('ended', () => this.next());
    document.querySelector('[data-play-toggle]')?.addEventListener('click', () => this.toggle());
    document.querySelector('[data-next]')?.addEventListener('click', () => this.next());
    document.querySelector('[data-prev]')?.addEventListener('click', () => this.previous());
    document.querySelector('[data-progress]')?.addEventListener('click', (event) => this.seek(event));
    document.querySelector('[data-volume]')?.addEventListener('input', (event) => this.setVolume(event.target.value));

    document.addEventListener('keydown', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (target?.isContentEditable) return;

      switch (event.key) {
        case ' ': 
        case 'Spacebar':
          event.preventDefault();
          this.toggle();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.next();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          this.previous();
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.setVolume(Math.min(1, this.audio.volume + 0.1));
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.setVolume(Math.max(0, this.audio.volume - 0.1));
          break;
      }
    });
  }

  async loadSong(songId) {
    const song = getSongById(songId);
    if (!song) return;
    this.currentSongId = song.id;
    this.currentIndex = this.playlist.findIndex(item => item.id === song.id);
    if (this.currentIndex < 0) {
      if (this.playlist.length) {
        this.playlist.unshift(song);
        this.currentIndex = 0;
      } else {
        this.currentIndex = 0;
        this.playlist = [song];
      }
    }
    this.currentTime = Number(localStorage.getItem(`wave-track-time:${song.id}`) || 0);
    this.audio.src = song.audio;
    this.audio.load();
    this.renderSong(song);
    localStorage.setItem('wave-last-track', String(song.id));
    this.audio.currentTime = this.currentTime;
    this.persistQueue();
    await this.audio.play().catch(() => {
      this.isPlaying = false;
      this.renderPlaybackState();
    });
    this.isPlaying = true;
    this.renderPlaybackState();
  }

  setQueue(items) {
    this.playlist = [...items];
    this.currentIndex = this.playlist.findIndex(song => song.id === this.currentSongId);
    if (this.currentIndex < 0) {
      this.currentIndex = this.playlist.length ? 0 : -1;
      if (this.currentIndex >= 0) {
        this.currentSongId = this.playlist[0].id;
      }
    }
    this.persistQueue();
  }

  persistQueue() {
    const queueState = this.playlist.map(song => song.id);
    const currentTime = this.audio?.currentTime || this.currentTime || 0;
    localStorage.setItem('wave-queue', JSON.stringify(queueState));
    localStorage.setItem('wave-current-song', String(this.currentSongId));
    localStorage.setItem('wave-current-time', String(currentTime));
    localStorage.setItem(`wave-track-time:${this.currentSongId}`, String(currentTime));
    localStorage.setItem('wave-is-playing', this.isPlaying ? '1' : '0');
  }

  restoreQueue() {
    const savedQueue = localStorage.getItem('wave-queue');
    if (!savedQueue) return false;
    try {
      const parsed = JSON.parse(savedQueue);
      const items = parsed.map(id => getSongById(id)).filter(Boolean);
      if (items.length) {
        this.playlist = items;
        this.currentSongId = Number(localStorage.getItem('wave-current-song') || items[0].id);
        this.currentIndex = this.playlist.findIndex(song => song.id === this.currentSongId);
        if (this.currentIndex < 0) this.currentIndex = 0;
        this.isPlaying = localStorage.getItem('wave-is-playing') === '1';
        this.currentTime = Number(localStorage.getItem(`wave-track-time:${this.currentSongId}`) || localStorage.getItem('wave-current-time') || 0);
        const song = getSongById(this.currentSongId);
        if (song && this.audio) {
          this.audio.src = song.audio;
          this.audio.load();
          this.audio.currentTime = this.currentTime;
          this.renderSong(song);
          this.renderPlaybackState();
          if (this.isPlaying) {
            this.audio.play().catch(() => {
              this.isPlaying = false;
              this.renderPlaybackState();
            });
          }
        }
        return true;
      }
    } catch (error) {
      console.warn('Failed to restore queue', error);
    }
    return false;
  }

  clear() {
    this.playlist = [];
    this.currentIndex = -1;
    this.audio.pause();
    this.audio.src = '';
    this.isPlaying = false;
    this.persistQueue();
    this.updateProgress();
    this.renderPlaybackState();
  }

  play() {
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.persistQueue();
      this.renderPlaybackState();
    }).catch(() => {
      this.isPlaying = false;
      this.persistQueue();
      this.renderPlaybackState();
    });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.persistQueue();
    this.renderPlaybackState();
  }

  toggle() {
    if (this.isPlaying) this.pause(); else this.play();
  }

  next() {
    if (!this.playlist.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.loadSong(this.playlist[this.currentIndex].id);
  }

  previous() {
    if (!this.playlist.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadSong(this.playlist[this.currentIndex].id);
  }

  seek(event) {
    if (!this.audio.duration || Number.isNaN(this.audio.duration) || !Number.isFinite(this.audio.duration)) return;
    const progressTrack = event.currentTarget;
    const rect = progressTrack.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    this.audio.currentTime = ratio * this.audio.duration;
    this.updateProgress();
  }

  setVolume(value) {
    this.audio.volume = Number(value);
    if (this.volumeControl) this.volumeControl.value = String(this.audio.volume);
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
