export default class Favorites {
  constructor() {
    this.storageKey = 'wave-favorites';
    this.favorites = this.load();
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      return [];
    }
  }

  toggle(songId) {
    const id = Number(songId);
    if (this.favorites.includes(id)) {
      this.favorites = this.favorites.filter(item => item !== id);
    } else {
      this.favorites = [...this.favorites, id];
    }
    localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
    return this.favorites.includes(id);
  }

  isFavorite(songId) {
    return this.favorites.includes(Number(songId));
  }
}
