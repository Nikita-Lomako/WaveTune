export default function renderPlayerBar() {
  const player = document.querySelector('[data-player]');
  if (!player) return;

  if (player.querySelector('[data-play-toggle]')) {
    return;
  }

  player.innerHTML = `
    <div class="player-bar__left">
      <img data-player-cover src="https://picsum.photos/seed/1/300/300" alt="Обложка">
      <div class="player-bar__meta">
        <span class="player-bar__title" data-player-title>Neon Pulse</span>
        <span class="player-bar__artist" data-player-artist>Cipher 9</span>
      </div>
    </div>
    <div class="player-bar__center">
      <div class="player-bar__controls">
        <button class="icon-button" aria-label="Предыдущий"><i class="fa-solid fa-backward-step" data-prev></i></button>
        <button class="icon-button" data-play-toggle aria-label="Воспроизвести"><i class="fa-solid fa-play"></i></button>
        <button class="icon-button" aria-label="Следующий"><i class="fa-solid fa-forward-step" data-next></i></button>
      </div>
      <div class="player-bar__progress">
        <span data-current-time>0:00</span>
        <div class="progress-track" data-progress>
          <div class="progress-fill" data-progress-fill style="width:0%"></div>
        </div>
        <span data-total-time>0:00</span>
      </div>
    </div>
    <div class="player-bar__right">
      <div class="volume-row">
        <i class="fa-solid fa-volume-high"></i>
        <input type="range" min="0" max="1" step="0.01" value="0.8" data-volume aria-label="Громкость">
      </div>
    </div>
    <audio id="audio" preload="metadata" src=""></audio>
  `;
}