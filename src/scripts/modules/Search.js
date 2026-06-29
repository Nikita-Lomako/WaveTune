import { sanitizeText, songs } from './Data.js';

export default class Search {
  constructor(onResults) {
    this.input = document.querySelector('[data-search-input]');
    this.onResults = onResults;
    this.bindEvents();
  }

  bindEvents() {
    this.input?.addEventListener('input', (event) => {
      const value = sanitizeText(event.target.value).toLowerCase();
      const filtered = songs.filter(song => {
        const haystack = `${song.title} ${song.artist}`.toLowerCase();
        return haystack.includes(value);
      });
      this.onResults(filtered);
    });
  }
}
