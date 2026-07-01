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
  const previousIndex = previousQueue.findIndex(item => item.id === player.currentSongId);
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

  const currentInQueue = queue.some(item => item.id === player.currentSongId);
  const replacementAtActiveSlot = Boolean(options.switchOnReplacement && previousIndex >= 0 && queue[previousIndex]?.id && queue[previousIndex].id !== player.currentSongId);

  if (forceTop || !currentInQueue) {
    player.loadSong(queue[0].id);
    return;
  }

  if (replacementAtActiveSlot) {
    player.loadSong(queue[previousIndex].id);
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
  player.loadSong(song.id);
}

function handleQueueReorder(newQueue) {
  updateQueue(newQueue, false, { switchOnReplacement: true });
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
  renderRecommendations(songs);
  const restoredQueue = player.restoreQueue();
  if (restoredQueue) {
    queue = [...player.playlist];
    playlistPanel.setQueue(queue);
    updateQueue(queue);
  } else {
    updateQueue([]);
  }

  document.addEventListener('click', handleFavoritesClick);
  document.querySelector('[data-playlists-link]')?.addEventListener('click', handlePlaylistsLink);
  new Search((filtered) => {
    currentVisibleSongs = filtered;
    renderRecommendations(filtered);
  });
}

init();