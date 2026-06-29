export default class Auth {
  constructor() {
    this.storageKey = 'wave-user';
    this.user = this.getStoredUser();
  }

  getStoredUser() {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : null;
  }

  isAuthenticated() {
    return Boolean(this.user);
  }

  login(user) {
    this.user = user;
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    document.cookie = `wave-session=${user.id}; path=/; max-age=86400`;
    return this.user;
  }

  logout() {
    this.user = null;
    localStorage.removeItem(this.storageKey);
    document.cookie = 'wave-session=; path=/; max-age=0';
  }
}
