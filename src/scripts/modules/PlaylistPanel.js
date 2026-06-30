export default class PlaylistPanel {
  constructor(options = {}) {
    this.panel = document.getElementById('queuePanel');
    this.toggleButtons = document.querySelectorAll('[data-queue-toggle]');
    this.backdrop = document.querySelector('[data-queue-backdrop]');
    this.list = document.getElementById('queueList');
    this.isOpen = false;
    this.queue = [];
    this.onSelect = options.onSelect;
    this.onRemove = options.onRemove;
    this.onReorder = options.onReorder;
    this.onAutoPlay = options.onAutoPlay;
    this.sideToggleIcon = document.querySelector('.queue-panel__toggle i');

    this.toggleButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      });
    });
    
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }
    
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen) this.close();
    });
  }

  setQueue(items) {
    this.queue = [...items];
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
    this.panel?.classList.toggle('is-closed', !this.isOpen);
    this.backdrop?.classList.toggle('is-visible', this.isOpen);
    this.sideToggleIcon?.classList.toggle('fa-chevron-right', this.isOpen);
    this.sideToggleIcon?.classList.toggle('fa-chevron-left', !this.isOpen);
  }

  render() {
    if (!this.list) return;
    this.list.innerHTML = '';
    if (!this.queue.length) {
      this.list.innerHTML = '<li class="queue-panel__hint">Очередь пуста. Нажмите на трек, чтобы добавить его сюда.</li>';
      return;
    }
    this.queue.forEach((song, index) => {
      const item = document.createElement('li');
      item.className = 'queue-item';
      item.dataset.songId = song.id;
      item.draggable = true;
      item.tabIndex = 0;
      item.innerHTML = `
        <div>
          <div class="queue-item__title">${song.title}</div>
          <div class="queue-item__artist">${song.artist}</div>
        </div>
        <button class="ghost-button" type="button" data-remove-queue="${song.id}" aria-label="Удалить из очереди">✕</button>
      `;

      item.addEventListener('click', (event) => {
        if (event.target.closest('[data-remove-queue]')) return;
        this.onSelect?.(song.id);
      });

      item.addEventListener('dragstart', (event) => {
        item.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(song.id));
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });

      item.addEventListener('dragover', (event) => {
        event.preventDefault();
        item.classList.add('drag-over');
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-over');
      });

      item.addEventListener('drop', (event) => {
        event.preventDefault();
        item.classList.remove('drag-over');
        const draggedId = Number(event.dataTransfer.getData('text/plain'));
        const targetId = Number(item.dataset.songId);
        if (Number.isNaN(draggedId) || draggedId === targetId) return;

        const reordered = [...this.queue];
        const draggedIndex = reordered.findIndex(entry => entry.id === draggedId);
        const targetIndex = reordered.findIndex(entry => entry.id === targetId);
        if (draggedIndex < 0 || targetIndex < 0) return;

        const [moved] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, moved);
        this.setQueue(reordered);
        this.onReorder?.(reordered);
      });

      const removeButton = item.querySelector('[data-remove-queue]');
      removeButton?.addEventListener('click', (event) => {
        event.stopPropagation();
        const removedId = Number(removeButton.dataset.removeQueue);
        this.onRemove?.(removedId);
      });

      this.list.appendChild(item);
    });
  }
}
