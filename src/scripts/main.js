import renderHeader from './components/Header.js';
import renderSidebar from './components/Sidebar.js';
import renderPlayerBar from './components/PlayerBar.js';
import { songs, formatTime, getSongById } from './modules/Data.js';
import Theme from './modules/Theme.js';
import Player from './modules/Player.js';
import Search from './modules/Search.js';
import Favorites from './modules/Favorites.js';
import PlaylistPanel from './modules/PlaylistPanel.js';
import Auth from './modules/Auth.js';

const auth = new Auth();
const favorites = new Favorites();
const theme = new Theme();
const player = new Player();
const playlistPanel = new PlaylistPanel({
  onSelect: loadQueueSong,
  onRemove: removeFromQueue,
  onReorder: handleQueueReorder,
  onAutoPlay: (id) => player.loadSong(id)
});

let currentVisibleSongs = [...songs];
let queue = [];

// Функция обновления очереди
function updateQueue(items, forceTop = false, options = {}) {
  const previousQueue = [...queue];
  const currentSongIdBeforeUpdate = player.currentSongId;
  const previousIndex = previousQueue.findIndex(item => item.id === currentSongIdBeforeUpdate);
  queue = [...items];
  playlistPanel.setQueue(queue);
  player.setQueue(queue);

  const queueHint = document.getElementById('queueHint');
  if (queueHint) {
    queueHint.textContent = queue.length ? `Всего треков: ${queue.length}` : 'Очередь пуста';
  }

  if (!queue.length) {
    player.clear();
    return;
  }

  const currentInQueue = queue.some(item => item.id === currentSongIdBeforeUpdate);
  const replacementAtActiveSlot = Boolean(options.switchOnReplacement && previousIndex >= 0 && queue[previousIndex]?.id && queue[previousIndex].id !== currentSongIdBeforeUpdate);
  const removedCurrentTrack = Boolean(options.switchOnReplacement && previousIndex >= 0 && !currentInQueue);

  if (forceTop || !currentInQueue) {
    const nextSongId = queue[0]?.id;
    if (nextSongId) {
      player.loadSong(nextSongId, { resume: false });
    }
    return;
  }

  if (replacementAtActiveSlot) {
    player.loadSong(queue[previousIndex].id, { resume: false });
  }

  if (removedCurrentTrack) {
    const nextSongId = queue[0]?.id;
    if (nextSongId) {
      player.loadSong(nextSongId, { resume: false });
    }
  }
}

function addToQueue(songId) {
  const song = getSongById(songId);
  if (!song) return;

  const existingIndex = queue.findIndex(item => item.id === song.id);
  if (existingIndex >= 0) {
    const reordered = [...queue];
    const [moved] = reordered.splice(existingIndex, 1);
    reordered.unshift(moved);
    updateQueue(reordered, true, { switchOnReplacement: true });
    return;
  }

  updateQueue([song, ...queue], true);
}

function removeFromQueue(songId) {
  updateQueue(queue.filter(song => song.id !== songId), false, { switchOnReplacement: true });
}

function loadQueueSong(songId) {
  const song = queue.find(item => item.id === Number(songId));
  if (!song) return;
  player.loadSong(song.id, { resume: false });
}

function handleQueueReorder(newQueue) {
  updateQueue(newQueue, false, { switchOnReplacement: true });
}

function getRouteFromPath(pathname = window.location.pathname) {
  const normalized = pathname.replace(/\\/g, '/');
  if (normalized === '/' || normalized.endsWith('/index.html')) return 'home';
  if (normalized.includes('/explore.html')) return 'explore';
  if (normalized.includes('/settings.html')) return 'settings';
  return 'home';
}

function updateActiveNav(route) {
  document.querySelectorAll('.sidebar__nav .sidebar__link').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const pathname = new URL(href, window.location.href).pathname;
    const isHome = route === 'home' && pathname.endsWith('/index.html');
    const isExplore = route === 'explore' && pathname.includes('/explore.html');
    link.classList.toggle('is-active', isHome || isExplore);
  });
}

function renderHomeContent() {
  const mainContent = document.getElementById('mainContent');
  if (!mainContent) return;
  mainContent.innerHTML = `
    <section class="panel-card" aria-labelledby="recommendations-title">
      <div class="section-head">
        <h2 id="recommendations-title">Рекомендации</h2>
        <span class="badge">Tracks</span>
      </div>
      <div class="recommendations-grid" id="recommendationsGrid"></div>
    </section>
  `;
  renderRecommendations(songs);
}

function renderExploreContent() {
  const mainContent = document.getElementById('mainContent');
  if (!mainContent) return;
  mainContent.innerHTML = `
    <section class="panel-card explore-hero">
      <div class="section-head">
        <div>
          <h1>Обзор</h1>
          <p class="badge">Исследуйте музыку по жанрам и настроению</p>
        </div>
        <a class="button-secondary" href="/index.html">← На главную</a>
      </div>
      <label class="search-field explore-search" aria-label="Поиск по музыке">
        <i class="fa-solid fa-magnifying-glass search-field__icon"></i>
        <input type="search" placeholder="Поиск по жанрам, артистам и трекам" />
      </label>
      <div class="explore-sections">
        <div class="explore-group">
          <h2>Жанры</h2>
          <div class="chip-row">
            <a class="chip" href="#">Hip-Hop</a>
            <a class="chip" href="#">Rock</a>
            <a class="chip" href="#">Pop</a>
            <a class="chip" href="#">Jazz</a>
            <a class="chip" href="#">Electronic</a>
          </div>
        </div>
        <div class="explore-group">
          <h2>Настроение</h2>
          <div class="chip-row">
            <a class="chip" href="#">Workout</a>
            <a class="chip" href="#">Relax</a>
            <a class="chip" href="#">Party</a>
            <a class="chip" href="#">Focus</a>
            <a class="chip" href="#">Romance</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSettingsContent() {
  const mainContent = document.getElementById('mainContent');
  if (!mainContent) return;
  mainContent.innerHTML = `
    <section class="panel-card settings-card">
      <div class="section-head">
        <div>
          <h1>Настройки аккаунта</h1>
          <p class="badge">Личный профиль</p>
        </div>
        <a class="button-secondary" href="/index.html">← На главную</a>
      </div>
      <form id="settingsForm" class="settings-form">
        <label class="settings-field">
          <span>Фото профиля</span>
          <input type="url" name="avatar" placeholder="https://..." />
        </label>
        <label class="settings-field">
          <span>Имя аккаунта</span>
          <input type="text" name="name" placeholder="Ваше имя" required />
        </label>
        <button class="button-primary" type="submit">Сохранить</button>
      </form>
    </section>
  `;

  const form = document.getElementById('settingsForm');
  if (!form) return;
  const user = auth.user;
  if (!auth.isAuthenticated()) {
    window.location.href = '/src/pages/login.html';
    return;
  }
  form.elements.name.value = user.name || '';
  form.elements.avatar.value = user.avatar || '';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const nextUser = { ...user, name: form.elements.name.value.trim() || user.name, avatar: form.elements.avatar.value.trim() };
    auth.login(nextUser);
    renderAuthArea();
    navigateTo('/index.html');
  });
}

function renderRoute(route) {
  updateActiveNav(route);
  if (route === 'home') {
    renderHomeContent();
    return;
  }
  if (route === 'explore') {
    renderExploreContent();
    return;
  }
  if (route === 'settings') {
    renderSettingsContent();
  }
}

function navigateTo(path) {
  const url = new URL(path, window.location.href);
  const nextPath = `${url.pathname}${url.search}${url.hash}`;
  history.pushState({}, '', nextPath);
  renderRoute(getRouteFromPath(nextPath));
}

function handleAppLinkClick(event) {
  const link = event.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
  const url = new URL(href, window.location.href);
  const isInternalRoute = url.origin === window.location.origin && (url.pathname.endsWith('/index.html') || url.pathname.includes('/explore.html') || url.pathname.includes('/settings.html'));
  if (!isInternalRoute) return;
  event.preventDefault();
  navigateTo(url.pathname + url.search + url.hash);
}

function renderRecommendations(items = songs) {
  const container = document.getElementById('recommendationsGrid');
  if (!container) return;
  currentVisibleSongs = items;
  container.innerHTML = '';
  if (!items.length) {
    container.innerHTML = '<div class="empty-state">Ничего не найдено</div>';
    return;
  }
  items.forEach(song => {
    const article = document.createElement('article');
    article.className = 'track-card';
    article.dataset.songId = song.id;
    article.innerHTML = `
      <img class="track-card__cover" src="${song.cover}" alt="${song.title}">
      <div class="track-card__meta">
        <div>
          <div class="track-card__title">${song.title}</div>
          <div class="track-card__artist">${song.artist}</div>
        </div>
        <button class="icon-button fav-toggle ${favorites.isFavorite(song.id) ? 'is-favorite' : ''}" data-fav-toggle="${song.id}" aria-label="Добавить в избранное">
          <i class="fa-${favorites.isFavorite(song.id) ? 'solid' : 'regular'} fa-heart"></i>
        </button>
      </div>
      <div class="track-card__actions">
        <span class="badge">${song.album}</span>
        <span class="badge">${formatTime(song.duration)}</span>
      </div>
    `;
    article.addEventListener('click', (event) => {
      if (event.target.closest('[data-fav-toggle]')) return;
      addToQueue(song.id);
    });
    container.appendChild(article);
  });
}

function renderAuthArea() {
  const area = document.querySelector('[data-auth-area]');
  if (!area) return;
  if (!auth.isAuthenticated()) {
    area.innerHTML = `
      <div class="auth-buttons">
        <a class="button-secondary" href="src/pages/register.html">Зарегистрироваться</a>
        <a class="button-primary" href="src/pages/login.html">Войти</a>
      </div>
    `;
    return;
  }
  const user = auth.user;
  const avatarSrc = user.avatar || `https://pravatar.cc/100?u=${user.id}`;
  area.innerHTML = `
    <div style="position:relative">
      <button class="avatar-button" type="button" data-account-toggle>
        <img src="${avatarSrc}" alt="${user.name}">
        <span>${user.name}</span>
      </button>
      <div class="account-menu hidden" data-account-menu>
        <a class="sidebar__link" href="src/pages/settings.html">Настройки</a>
        <button class="sidebar__link" type="button" data-logout>Log Out</button>
      </div>
    </div>
  `;
  area.querySelector('[data-account-toggle]')?.addEventListener('click', () => {
    area.querySelector('[data-account-menu]')?.classList.toggle('hidden');
  });
  area.querySelector('[data-logout]')?.addEventListener('click', () => {
    auth.logout();
    renderAuthArea();
  });
}

function handleFavoritesClick(event) {
  const button = event.target.closest('[data-fav-toggle]');
  if (!button) return;
  event.stopPropagation();
  const songId = Number(button.dataset.favToggle);
  favorites.toggle(songId);
  renderRecommendations(currentVisibleSongs);
}

function handlePlaylistsLink() {
  const isGuest = !auth.isAuthenticated();
  if (isGuest) {
    const shouldLogin = confirm('Неавторизованные пользователи не могут составлять и просматривать свои плейлисты. Желаете войти в аккаунт?');
    if (shouldLogin) window.location.href = 'src/pages/login.html';
    return;
  }
}

function init() {
  renderHeader();
  renderSidebar();
  renderPlayerBar();
  player.bindEvents();
  theme.init();
  renderAuthArea();
  renderRoute(getRouteFromPath(window.location.pathname));
  const restoredQueue = player.restoreQueue();
  if (restoredQueue) {
    queue = [...player.playlist];
    playlistPanel.setQueue(queue);
    updateQueue(queue);
  } else {
    updateQueue([]);
  }

  document.addEventListener('click', handleFavoritesClick);
  document.addEventListener('click', handleAppLinkClick);
  document.querySelector('[data-playlists-link]')?.addEventListener('click', handlePlaylistsLink);
  window.addEventListener('popstate', () => {
    renderRoute(getRouteFromPath(window.location.pathname));
  });
  new Search((filtered) => {
    currentVisibleSongs = filtered;
    renderRecommendations(filtered);
  });
}

init();