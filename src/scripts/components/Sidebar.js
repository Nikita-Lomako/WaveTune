export default function renderSidebar() {
  const sidebar = document.querySelector('[data-sidebar]');
  if (!sidebar) return;
  sidebar.innerHTML = `
    <nav aria-label="Основная навигация">
      <ul class="sidebar__nav">
        <li><a class="sidebar__link is-active" href="/index.html"><span><i class="fa-solid fa-house"></i> Главная</span></a></li>
        <li><a class="sidebar__link" href="/src/pages/explore.html"><span><i class="fa-solid fa-compass"></i> Обзор</span></a></li>
        <li><button class="sidebar__link" type="button" data-playlists-link><span><i class="fa-solid fa-list-ul"></i> Мои плейлисты</span></button></li>
      </ul>
    </nav>
    <section class="sidebar__section" aria-label="Плейлисты">
      <div class="sidebar__section-header">
        <h2>Плейлисты</h2>
      </div>
      <ul class="sidebar__playlist-list">
        <li><button class="sidebar__playlist-item" type="button"><span><i class="fa-solid fa-play"></i> Для пробежки</span></button></li>
        <li><button class="sidebar__playlist-item" type="button"><span><i class="fa-solid fa-play"></i> Вечерний</span></button></li>
        <li><button class="sidebar__playlist-item" type="button"><span><i class="fa-solid fa-play"></i> Хиты 2025</span></button></li>
      </ul>
    </section>
  `;
}
