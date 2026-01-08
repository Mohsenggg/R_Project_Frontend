import { Injectable, ElementRef } from "@angular/core";

@Injectable()
export class TreePanningService {

      private isDragging = false;
      private panStartX = 0;
      private panStartY = 0;
      private panScrollLeft = 0;
      private panScrollTop = 0;

      private scrollContainer!: HTMLElement;

      // Use arrow functions to bind 'this' for event listeners
      private readonly onMouseMoveHandler = (event: MouseEvent) => this.onMouseMove(event);
      private readonly onMouseUpHandler = () => this.onMouseUp();

      init(container: HTMLElement): void {
            this.scrollContainer = container;
      }

      onMouseDown(event: MouseEvent): void {
            if (!this.scrollContainer) return;

            // Only left click
            if (event.button !== 0) return;

            // Check if clicking on a card - if so, don't pan (let it be a selection)
            const target = event.target as HTMLElement;
            if (target.closest('.member-card')) return;

            this.isDragging = true;
            const container = this.scrollContainer;

            this.panStartX = event.pageX - container.offsetLeft;
            this.panStartY = event.pageY - container.offsetTop;
            this.panScrollLeft = container.scrollLeft;
            this.panScrollTop = container.scrollTop;

            container.classList.add('panning');
            container.style.cursor = 'grabbing';
            container.style.userSelect = 'none';

            // Add global listeners to handle dragging outside the container
            window.addEventListener('mousemove', this.onMouseMoveHandler);
            window.addEventListener('mouseup', this.onMouseUpHandler);
      }

      private onMouseMove(event: MouseEvent): void {
            if (!this.isDragging || !this.scrollContainer) return;

            event.preventDefault();
            const container = this.scrollContainer;

            const x = event.pageX - container.offsetLeft;
            const y = event.pageY - container.offsetTop;

            const walkX = (x - this.panStartX) * 1.5; // Drag speed multiplier
            const walkY = (y - this.panStartY) * 1.5;

            container.scrollLeft = this.panScrollLeft - walkX;
            container.scrollTop = this.panScrollTop - walkY;
      }

      private onMouseUp(): void {
            if (!this.isDragging || !this.scrollContainer) return;

            this.isDragging = false;
            const container = this.scrollContainer;
            container.classList.remove('panning');
            container.style.cursor = 'grab';
            container.style.removeProperty('user-select');

            window.removeEventListener('mousemove', this.onMouseMoveHandler);
            window.removeEventListener('mouseup', this.onMouseUpHandler);
      }

      destroy(): void {
            if (typeof window !== 'undefined') {
                  window.removeEventListener('mousemove', this.onMouseMoveHandler);
                  window.removeEventListener('mouseup', this.onMouseUpHandler);
            }
      }
}
