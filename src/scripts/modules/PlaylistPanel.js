export default class PlaylistPanel {
  constructor() {
    this.panel = document.getElementById('queuePanel');
    this.toggleButton = document.querySelector('[data-queue-toggle]');
    this.closeButton = document.querySelector('[data-queue-close]');
    this.backdrop = document.querySelector('[data-queue-backdrop]');
    this.list = document.getElementById('queueList');
    this.isOpen = false;
    this.queue = [];
    
    console.log('[PlaylistPanel] Constructor:', {
      toggleButton: !!this.toggleButton,
      closeButton: !!this.closeButton,
      backdrop: !!this.backdrop,
      panel: !!this.panel
    });
    
    // Bind events immediately
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('[PlaylistPanel] Toggle clicked, isOpen:', this.isOpen);
        this.toggle();
      });
    } else {
      console.warn('[PlaylistPanel] toggleButton not found!');
    }
    
    if (this.closeButton) {
      this.closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });
    }
    
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }
    
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen) this.close();
    });
  }

  setQueue(items) {
    this.queue = items;
    this.render();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.renderState();
  }

  open() {
    this.isOpen = true;
    this.renderState();
  }

  close() {
    this.isOpen = false;
    this.renderState();
  }

  renderState() {
    this.panel?.classList.toggle('is-open', this.isOpen);
    this.backdrop?.classList.toggle('is-visible', this.isOpen);
    this.toggleButton?.setAttribute('aria-expanded', this.isOpen ? 'true' : 'false');
  }

  render() {
    if (!this.list) return;
    this.list.innerHTML = '';
    if (!this.queue.length) {
      this.list.innerHTML = '<li class="queue-panel__hint">Очередь пуста. Нажмите на трек, чтобы добавить его сюда.</li>';
      return;
    }
    this.queue.forEach(song => {
      const item = document.createElement('li');
      item.className = 'queue-item';
      item.innerHTML = `
        <div>
          <div class="queue-item__title">${song.title}</div>
          <div class="queue-item__artist">${song.artist}</div>
        </div>
        <button class="ghost-button" data-remove-queue="${song.id}" aria-label="Удалить из очереди">✕</button>
      `;
      this.list.appendChild(item);
    });
  }
}
