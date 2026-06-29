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
const playlistPanel = new PlaylistPanel();

let currentVisibleSongs = [...songs];
let favoritesOnly = false;

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
      player.loadSong(song.id);
      renderPlaylist(getFilteredSongs());
      playlistPanel.setQueue(getFilteredSongs());
    });
    container.appendChild(article);
  });
}

function getFilteredSongs() {
  if (!favoritesOnly) return [...currentVisibleSongs];
  return currentVisibleSongs.filter(song => favorites.isFavorite(song.id));
}

function renderPlaylist(items = getFilteredSongs()) {
  const body = document.querySelector('[data-playlist-body]');
  if (!body) return;
  const visibleItems = items.length ? items : getFilteredSongs();
  body.innerHTML = '';
  if (!visibleItems.length) {
    body.innerHTML = '<tr><td colspan="4" class="empty-state">Нет треков для отображения</td></tr>';
    return;
  }
  visibleItems.forEach(song => {
    const row = document.createElement('tr');
    row.dataset.songId = song.id;
    row.className = `playlist-row ${player.currentSongId === song.id ? 'is-active' : ''}`;
    row.innerHTML = `
      <td>${song.title}</td>
      <td>${song.artist}</td>
      <td>${formatTime(song.duration)}</td>
      <td><button class="icon-button table-action ${favorites.isFavorite(song.id) ? 'is-favorite' : ''}" data-fav-toggle="${song.id}" aria-label="Лайк"><i class="fa-${favorites.isFavorite(song.id) ? 'solid' : 'regular'} fa-heart"></i></button></td>
    `;
    row.addEventListener('click', (event) => {
      if (event.target.closest('[data-fav-toggle]')) return;
      player.loadSong(song.id);
      renderPlaylist(getFilteredSongs());
    });
    body.appendChild(row);
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
  area.innerHTML = `
    <div style="position:relative">
      <button class="avatar-button" type="button" data-account-toggle>
        <img src="https://pravatar.cc/100?u=${user.id}" alt="${user.name}">
        <span>${user.name}</span>
      </button>
      <div class="account-menu hidden" data-account-menu>
        <a class="sidebar__link" href="src/pages/register.html">Настройки</a>
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
  renderRecommendations(getFilteredSongs());
  renderPlaylist(getFilteredSongs());
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
  renderPlaylist(songs);
  playlistPanel.setQueue(songs);
  player.loadSong(player.currentSongId);

  document.addEventListener('click', handleFavoritesClick);
  document.querySelector('[data-playlists-link]')?.addEventListener('click', handlePlaylistsLink);
  document.getElementById('favoritesToggle')?.addEventListener('click', () => {
    favoritesOnly = !favoritesOnly;
    document.getElementById('favoritesToggle').textContent = favoritesOnly ? 'Показать все' : 'Показать избранные';
    document.getElementById('playlistModeLabel').textContent = favoritesOnly ? 'Сейчас: Избранные' : 'Сейчас: Все треки';
    renderPlaylist(getFilteredSongs());
  });
  new Search((filtered) => {
    currentVisibleSongs = filtered;
    renderRecommendations(filtered);
    renderPlaylist(getFilteredSongs());
  });
}

init();