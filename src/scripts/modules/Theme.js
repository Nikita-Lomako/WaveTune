export default class Theme {
  constructor() {
    this.storageKey = 'wave-theme';
    this.root = document.documentElement;
    this.button = document.querySelector('[data-theme-toggle]');
    this.currentTheme = this.getStoredTheme();
  }

  init() {
    this.apply(this.currentTheme);
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-theme-toggle]');
      if (!trigger) return;
      event.preventDefault();
      this.toggle();
    });
  }

  getStoredTheme() {
    return localStorage.getItem(this.storageKey) || 'dark';
  }

  apply(theme) {
    this.currentTheme = theme === 'light' ? 'light' : 'dark';
    this.root.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem(this.storageKey, this.currentTheme);
    this.renderIcon();
  }

  toggle() {
    this.apply(this.currentTheme === 'dark' ? 'light' : 'dark');
  }

  renderIcon() {
    if (!this.button) return;
    const icon = this.button.querySelector('i');
    if (!icon) return;
    icon.className = this.currentTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
}
