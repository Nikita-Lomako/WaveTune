export default function renderHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  header.innerHTML = `
    <div class="topbar__brand">
      <button class="burger" data-queue-toggle aria-label="Открыть очередь"><i class="fa-solid fa-bars"></i></button>
      <div>
        <p class="eyebrow">cyber audio</p>
        <h1>WaveTune</h1>
      </div>
    </div>
    <label class="search-field" aria-label="Поиск треков">
      <i class="fa-solid fa-magnifying-glass search-field__icon"></i>
      <input type="search" placeholder="Поиск треков" data-search-input aria-label="Поиск треков">
    </label>
    <div class="topbar__actions">
      <div class="auth-area" data-auth-area></div>
      <button class="icon-button" data-theme-toggle aria-label="Тема"><i class="fa-solid fa-sun"></i></button>
    </div>
  `;
}
