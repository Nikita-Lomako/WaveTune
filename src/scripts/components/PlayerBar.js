export default function renderPlayerBar() {
  const player = document.querySelector('[data-player]');
  if (!player) return;
  player.innerHTML = `
    <div class="player-bar__top">
      <div class="player-bar__track">
        <img data-player-cover src="https://picsum.photos/seed/default/80/80" alt="Обложка">
        <div class="player-bar__meta">
          <span class="player-bar__title" data-player-title>Выберите трек</span>
          <span class="player-bar__artist" data-player-artist>WaveTune</span>
        </div>
      </div>
      <div class="player-bar__controls">
        <button class="icon-button" aria-label="Предыдущий"><i class="fa-solid fa-backward-step" data-prev></i></button>
        <button class="icon-button" data-play-toggle aria-label="Воспроизвести"><i class="fa-solid fa-play"></i></button>
        <button class="icon-button" aria-label="Следующий"><i class="fa-solid fa-forward-step" data-next></i></button>
      </div>
      <div class="volume-row">
        <i class="fa-solid fa-volume-high"></i>
        <input type="range" min="0" max="1" step="0.01" value="0.8" data-volume aria-label="Громкость">
      </div>
    </div>
    <div class="player-bar__progress">
      <span data-current-time>0:00</span>
      <div class="progress-track" data-progress>
        <div class="progress-fill" data-progress-fill></div>
      </div>
      <span data-total-time>0:00</span>
    </div>
    <audio id="audio" preload="metadata"></audio>
  `;
}
